// Skills Satellite Charts — adapted from @john-guerra/skills Observable notebook
// Two charts matching the original layout: "My Skills" (areas) + "Tools I use"

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Shared color scale — matching categories get the same color across both charts
const sharedColor = d3
  .scaleOrdinal(d3.schemeSet2)
  .domain(["Research", "Engineering", "Education"])
  .range([
    "rgb(243,232,77)",
    "rgb(234,165,90)",
    "rgb(144,209,68)",
    "rgb(116,195,224)",
  ]);
const centralCircleColor = "rgb(91,122,146)";

// Human-readable category labels
const categoryLabels = {
  Research: "Research",
  Engineering: "Engineering",
  Education: "Education",
};

function SatellitesChart(containerEl, data, centerLabel, ariaLabel, color) {
  const width = containerEl.clientWidth || 300;
  const height = width;
  const bigR = width / 3.5;
  const overlapping = 0.95;
  const opacity = 0.95;
  const maxR = Math.max(width / 10, 15);

  const svg = d3
    .select(containerEl)
    .append("svg")
    .attr("width", "100%")
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("aria-label", ariaLabel);

  const filterId =
    "drop-" +
    Math.random()
      .toString(36)
      .slice(2, 8);
  svg
    .append("defs")
    .html(
      '<filter id="' +
        filterId +
        '" height="130%">' +
        '<feGaussianBlur in="SourceAlpha" stdDeviation="2"/>' +
        '<feOffset dx="1" dy="1" result="offsetblur"/>' +
        '<feComponentTransfer><feFuncA type="linear" slope="0.4"/></feComponentTransfer>' +
        '<feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>' +
        "</filter>",
    );

  // Central circle
  svg
    .append("circle")
    .attr("cx", width / 2)
    .attr("cy", height / 2)
    .attr("r", bigR)
    .style("filter", "url(#" + filterId + ")")
    .style("fill", centralCircleColor)
    .style("opacity", opacity);

  // Central label
  const lines = centerLabel.split("\n");
  const centerText = svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height / 2)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .attr("font-family", "Lato, sans-serif")
    .attr("font-weight", "700")
    .style("fill", "#fafafa");

  lines.forEach((line, i) => {
    centerText
      .append("tspan")
      .attr("x", width / 2)
      .attr("dy", i === 0 ? -0.6 * (lines.length - 1) + "em" : "1.2em")
      .attr("font-size", Math.max(width / 22, 10) + "px")
      .text(line);
  });

  // Compute hierarchy
  const root = d3.group(data, (d) => d.category);
  const tree = d3
    .hierarchy(root, (d) => d[1])
    .sum((d) => d.value)
    .sort((a, b) => b.value - a.value);

  const leaves = tree.leaves();
  const cats = [...new Map(data.map((d) => [d.category, d])).keys()];

  const rScale = d3
    .scaleSqrt()
    .domain([0, d3.max(leaves.map((d) => d.value))])
    .range([0, maxR]);

  // Place categories further from center for more spread
  const orbitR = bigR + maxR * 0.3;
  const radialScale = d3
    .scaleBand()
    .range([Math.PI / 6, Math.PI / 6 + 2 * Math.PI])
    .domain(cats)
    .align(0);

  const dPos = {};
  cats.forEach(
    (c) =>
      (dPos[c] = {
        x: orbitR * Math.cos(radialScale(c)) + width / 2,
        y: orbitR * Math.sin(radialScale(c)) + height / 2,
      }),
  );

  // Mouse repulsion — phantom node included in simulation but not rendered
  const mouseNode = { x: width / 2, y: height / 2, fx: null, fy: null };
  const simNodes = [...leaves, mouseNode];

  const simulation = d3
    .forceSimulation(simNodes)
    .force("charge", d3.forceManyBody().strength((d) =>
      d === mouseNode ? -150 : -8
    ))
    .force(
      "collide",
      d3.forceCollide((d) => d.data ? rScale(d.data.value) * overlapping + 2 : 0),
    )
    .force(
      "radial",
      d3.forceRadial((d) => d.data ? orbitR : 0, width / 2, height / 2).strength((d) => d.data ? 0.3 : 0),
    )
    .force("x", d3.forceX((d) => d.data ? dPos[d.data.category].x : width / 2).strength((d) => d.data ? 0.15 : 0))
    .force("y", d3.forceY((d) => d.data ? dPos[d.data.category].y : height / 2).strength((d) => d.data ? 0.15 : 0))
    .on("tick", ticked);

  // Layer 1: Circles
  const circleGroup = svg.append("g").attr("class", "circles");
  const circles = circleGroup
    .selectAll("circle")
    .data(leaves)
    .join("circle")
    .attr("r", (d) => rScale(d.data.value))
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y)
    .style("filter", "url(#" + filterId + ")")
    .style("fill", (d) => color(d.data.category))
    .style("opacity", opacity)
    .style("cursor", "grab")
    .call(
      d3
        .drag()
        .on("start", (event) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
        })
        .on("drag", (event) => {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        })
        .on("end", (event) => {
          if (!event.active) simulation.alphaTarget(0);
          event.subject.fx = null;
          event.subject.fy = null;
        }),
    );

  circles.append("title").text((d) => d.data.name);

  // Layer 2: Node labels (on top of all circles)
  const labelGroup = svg.append("g").attr("class", "node-labels");
  const nodeLabels = labelGroup
    .selectAll("g")
    .data(leaves)
    .join("g")
    .attr("transform", (d) => "translate(" + d.x + "," + d.y + ")")
    .each(function (d) {
      const r = rScale(d.data.value);
      const fontSize = Math.max(r / 2.8, 7);
      const words = d.data.name.split(" ");
      const text = d3.select(this)
        .append("text")
        .style("font-family", "Lato, sans-serif")
        .style("font-weight", "600")
        .style("text-anchor", "middle")
        .style("font-size", fontSize + "px")
        .style("pointer-events", "none")
        .style("fill", "#fff")
        .style("text-shadow", "0 1px 3px rgba(0,0,0,0.7)");
      words.forEach((word, i) => {
        text
          .append("tspan")
          .text(word)
          .attr("x", 0)
          .attr("dy", i === 0 ? -0.3 * (words.length - 1) + "em" : "1.1em");
      });
    });

  // Mouse interaction — move phantom node to repel bubbles
  svg.on("mousemove", (event) => {
    const [mx, my] = d3.pointer(event);
    mouseNode.fx = mx;
    mouseNode.fy = my;
    simulation.alphaTarget(0.1).restart();
  });

  svg.on("mouseleave", () => {
    mouseNode.fx = null;
    mouseNode.fy = null;
    simulation.alphaTarget(0);
  });

  // Category centroid labels — drawn on top of bubbles
  const catLabelGroup = svg.append("g").attr("class", "category-labels");
  const catLabelEls = catLabelGroup
    .selectAll("text")
    .data(cats)
    .join("text")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .attr("font-family", "'Roboto Condensed', 'Arial Narrow', sans-serif")
    .attr("font-weight", "700")
    .attr("font-size", Math.max(width / 20, 11) + "px")
    .attr("letter-spacing", "0.05em")
    .style("fill", (d) => color(d))
    .style("opacity", 0.4)
    .style("pointer-events", "none")
    .style("text-transform", "uppercase")
    .style("filter", "drop-shadow(0 1px 2px rgba(0,0,0,0.2))")
    .text((d) => categoryLabels[d] || d);

  function ticked() {
    circles.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    nodeLabels.attr("transform", (d) => "translate(" + d.x + "," + d.y + ")");

    // Update category label positions to centroid of their nodes
    catLabelEls.each(function(cat) {
      const catNodes = leaves.filter((d) => d.data && d.data.category === cat);
      const cx = d3.mean(catNodes, (d) => d.x);
      const cy = d3.mean(catNodes, (d) => d.y);
      d3.select(this)
        .attr("x", cx)
        .attr("y", cy);
    });
  }
}

// Load skills data from shared JSON (single source of truth)
fetch("skills.json")
  .then((r) => r.json())
  .then((skills) => {
    const el1 = document.getElementById("skillsChart1");
    if (el1)
      SatellitesChart(
        el1,
        skills.areas,
        "My Skills",
        `Skills areas: ${skills.areas.map((s) => s.name).join(", ")}`,
        sharedColor,
      );

    const el2 = document.getElementById("skillsChart2");
    if (el2)
      SatellitesChart(
        el2,
        skills.tools,
        "Tools &\nTechniques",
        `Tools: ${skills.tools.map((s) => s.name).join(", ")}`,
        sharedColor,
      );
  });
