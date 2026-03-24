// Skills Satellite Charts — adapted from @john-guerra/skills Observable notebook
// Two charts matching the original layout: "My Skills" (areas) + "Tools I use"

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

function SatellitesChart(containerEl, data, centerLabel, ariaLabel) {
  const width = containerEl.clientWidth || 300;
  const height = width;
  const bigR = width / 6; // Smaller center circle
  const overlapping = 0.7; // More separation between bubbles
  const opacity = 0.95;

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const svg = d3
    .select(containerEl)
    .append("svg")
    .attr("width", "100%")
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("aria-label", ariaLabel);

  const filterId = "drop-" + Math.random().toString(36).slice(2, 8);
  svg.append("defs").html(
    '<filter id="' + filterId + '" height="130%">' +
      '<feGaussianBlur in="SourceAlpha" stdDeviation="2"/>' +
      '<feOffset dx="1" dy="1" result="offsetblur"/>' +
      '<feComponentTransfer><feFuncA type="linear" slope="0.4"/></feComponentTransfer>' +
      '<feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>' +
    "</filter>"
  );

  // Central circle
  svg
    .append("circle")
    .attr("cx", width / 2)
    .attr("cy", height / 2)
    .attr("r", bigR)
    .style("filter", "url(#" + filterId + ")")
    .style("fill", "#80b1d3")
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
      .attr("dy", i === 0 ? (-0.6 * (lines.length - 1)) + "em" : "1.2em")
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

  const maxR = Math.max(width / 10, 22);
  const rScale = d3
    .scaleSqrt()
    .domain([0, d3.max(leaves.map((d) => d.value))])
    .range([8, maxR]);

  // Place categories further from center for more spread
  const orbitR = bigR + maxR * 1.8;
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
      })
  );

  const simulation = d3
    .forceSimulation(leaves)
    .force("charge", d3.forceManyBody().strength(-8))
    .force(
      "collide",
      d3.forceCollide((d) => rScale(d.data.value) * overlapping + 2)
    )
    .force("x", d3.forceX((d) => dPos[d.data.category].x).strength(0.4))
    .force("y", d3.forceY((d) => dPos[d.data.category].y).strength(0.4))
    .on("tick", ticked);

  const node = svg
    .append("g")
    .selectAll("g")
    .data(leaves)
    .join("g")
    .attr("transform", (d) => "translate(" + d.x + "," + d.y + ")");

  node
    .append("circle")
    .attr("r", (d) => rScale(d.data.value))
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
        })
    );

  // Labels with better legibility
  node.each(function (d) {
    const g = d3.select(this);
    const r = rScale(d.data.value);
    const fontSize = Math.max(r / 2.8, 7);
    const words = d.data.name.split(" ");

    const text = g
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
        .attr("dy", i === 0 ? (-0.3 * (words.length - 1)) + "em" : "1.1em");
    });
  });

  node.append("title").text((d) => d.data.name);

  function ticked() {
    node.attr("transform", (d) => "translate(" + d.x + "," + d.y + ")");
  }
}

// Chart 1: My Skills (areas of expertise)
const skillsAreas = [
  { name: "Information Visualization", value: 150, category: "Research" },
  { name: "Data Science", value: 120, category: "Research" },
  { name: "AI-Assisted Development", value: 130, category: "Applied" },
  { name: "System Architecture", value: 100, category: "Engineering" },
  { name: "User Evaluation", value: 100, category: "Research" },
  { name: "Accessibility", value: 120, category: "Applied" },
  { name: "User Interface Design", value: 80, category: "Engineering" },
  { name: "Machine Learning", value: 70, category: "Research" },
];

const el1 = document.getElementById("skillsChart1");
if (el1) SatellitesChart(el1, skillsAreas, "Visual\nAnalytics", "Skills areas: Information Visualization, Data Science, AI-Assisted Development, Accessibility, System Architecture, User Evaluation, UI Design, Machine Learning");

// Chart 2: Tools and techniques
const skillsTools = [
  { name: "D3.js", value: 150, category: "viz" },
  { name: "Vega-Lite", value: 130, category: "viz" },
  { name: "Observable", value: 100, category: "viz" },
  { name: "Tableau", value: 50, category: "viz" },
  { name: "HTML5 CSS", value: 70, category: "web" },
  { name: "Javascript", value: 80, category: "web" },
  { name: "React", value: 100, category: "web" },
  { name: "Svelte", value: 80, category: "web" },
  { name: "Node.js", value: 100, category: "web" },
  { name: "Python", value: 100, category: "data" },
  { name: "SQL", value: 100, category: "data" },
  { name: "DuckDB", value: 80, category: "data" },
  { name: "Pandas", value: 80, category: "data" },
  { name: "MongoDB", value: 100, category: "data" },
  { name: "Claude Code", value: 150, category: "AI" },
  { name: "Prompt Eng.", value: 100, category: "AI" },
  { name: "LLM APIs", value: 80, category: "AI" },
  { name: "MCP", value: 80, category: "AI" },
  { name: "Agents", value: 70, category: "AI" },
];

const el2 = document.getElementById("skillsChart2");
if (el2) SatellitesChart(el2, skillsTools, "Tools &\nTechniques", "Tools: D3.js, Vega-Lite, Observable, React, Svelte, Node.js, Python, SQL, Claude Code, Prompt Engineering, LLM APIs, MCP, Agents");
