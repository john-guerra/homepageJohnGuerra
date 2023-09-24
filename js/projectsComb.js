// Code inspired on VisualCinamon http://blockbuilder.org/john-guerra/e5d5fbb6c526000599d2c83639f6ade0
(function Comb() {
  /* global d3, CombColumns */
  //Function to call when you mouseover a node
  function mover(d) {
    var el = d3
      .select(this)
      .transition()
      .duration(10)
      .style("opacity", 0.3);
  }

  //Mouseout function
  function mout(d) {
    var el = d3
      .select(this)
      .transition()
      .duration(1000)
      .style("opacity", 1);
  }

  //svg sizes and margins
  var margin = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };

  var width = 850;
  var height = 2050;

  //The number of columns and rows of the heatmap
  var MapColumns = window.CombColumns || 5,
    MapRows; // I'll compute this later

  //Set the hexagon radius
  var hexbin = d3.hexbin();

  //Create SVG element
  d3.select("#projectsComb")
    .append("svg")
    // .style("width", "100%")
    // .style("height", "100%")
    // .attr("width", width + margin.left + margin.right)
    // .attr("height", height + margin.top + margin.bottom)
    .append("defs")
    .append("clipPath")
    .attr("id", "hexClip")
    .append("path");

  var svg = d3
    .select("#projectsComb>svg")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var projects = svg.append("g").attr("class", "projects");
  var mesh = svg.append("path").attr("class", "mesh");

  function updateComb(data) {
    // updateComb radius
    var svgNode = d3.select("#projectsComb").node();
    width = svgNode ? svgNode.clientWidth : width;
    height = d3.select("#achievementsText").node()
      ? d3.select("#achievementsText").node().clientHeight
      : window.innerHeight;

    // for PDF
    height = 900;


    var hexRadius = width / ((MapColumns + 0.5) * Math.sqrt(3));
    MapRows = Math.floor(height / (1.5 * hexRadius)) + 1;
    //Set the new height and width of the SVG based on the max possible
    // width = MapColumns*hexRadius*Math.sqrt(3);
    // heigth = MapRows*1.5*hexRadius+0.5*hexRadius;

    d3.select("#projectsComb>svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    var centers = hexbin
      .radius(hexRadius)
      .size([width, height])
      .centers();

    d3.select("#projectsComb > svg #hexClip > path")
      .attr(
        "transform",
        "translate(" + Math.sin(Math.PI / 3) * hexRadius + "," + hexRadius + ")"
      )
      .attr("d", function() {
        return hexbin.hexagon();
      });

    var fillingI = 0,
      importantI = data.length - 1; // Two indexes to fill the comb
    // Do smart assigment, don't put a project on a cut hexagon
    centers.forEach(function(center, i) {
      center.j = Math.round(center[1] / (hexRadius * 1.5));
      center.i = Math.round(
        (center[0] - (center.j & 1) * hexRadius * Math.sin(Math.PI / 3)) /
          (hexRadius * 2 * Math.sin(Math.PI / 3))
      );
      center.x = center[0] - Math.sin(Math.PI / 3) * hexRadius;
      center.y = center[1] - hexRadius;

      var even = center.j % 2 === 0;
      var proj;
      if (
        (even && center.i === 0) ||
        (!even && center.i >= MapColumns) ||
        center.j === 0 ||
        center.j === MapRows - 1
      ) {
        // Unimportant projects here
        proj = data[fillingI++ % data.length];
      } else {
        proj = data[importantI--];
        if (importantI === 0) {
          importantI = data.length - 1;
        }
      }
      if (proj) proj.index = i;
      center.proj = proj;
    });

    // data.forEach(function(proj) {
    //   if (i>= centers.length) return; //too many projects

    //   proj.j = Math.round(centers[i][1] / (hexRadius * 1.5));
    //   proj.i = Math.round((centers[i][0] - (proj.j & 1) * hexRadius * Math.sin(Math.PI / 3)) / (hexRadius * 2 * Math.sin(Math.PI / 3)));
    //   proj.x = centers[i][0] - Math.sin(Math.PI/3) * hexRadius;
    //   proj.y = centers[i][1] - hexRadius,
    //   proj.index = i;
    // });

    var projectsSel = projects.selectAll(".projectHex").data(centers);
    projectsSel
      .enter()
      .append("image")
      .attr("class", "projectHex")
      .merge(projectsSel)
      .filter(function(d) {
        return d.proj;
      })
      .attr("xlink:href", function(d) {
        var splitName = d.proj.thumb.split(".");
        return "img/projs/" + splitName[0] + "_small." + splitName[1];
      })
      .attr("width", hexRadius * 2)
      .attr("height", hexRadius * 2)
      .attr("preserveAspectRatio", "xMidYMid slice")
      .attr("clip-path", "url(#hexClip)")
      .on("click", function(d) {
        window.open(d.proj.url, "_blank");
      })

      .attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      })
      .on("mouseover", mover)
      .on("mouseout", mout)
      .append("title")
      .text(function(d) {
        return d.proj.project;
      });

    projectsSel.exit().remove();

    // svg.append("g")
    // .selectAll("circle")
    // .data(centers)
    // .enter()
    // .append("circle")
    //   .attr("cx", function (d) { return d[0]; })
    //   .attr("cy", function (d) { return d[1]; })
    //   .attr("r", 1);

    // svg.append("g")
    // .selectAll("circle")
    // .data(centers)
    // .enter()
    // .append("circle")
    //   .attr("cx", function (d) { return d[0]; })
    //   .attr("cy", function (d) { return d[1]; })
    //   .attr("r", hexRadius);

    svg.select(".mesh").attr("d", hexbin.mesh);

    // svg.append("path")
    //   .attr("transform", "translate(200,200)")
    //   .style("fill", "none")
    //   .style("stroke", "black")
    //   .attr("d", function () { return hexbin.hexagon(); });

    // svg.append("rect")
    //   .attr("x", 0)
    //   .attr("y", 0)
    //   .style("fill", "red")
    //   .attr("width", 500)
    //   .attr("height", 500)
    //   // .attr("clip-path", "url(#hexClip)")

    d3.select(window).on("resize", function() {
      updateComb(data);
    });
    // .each(function () { updateComb(data); });
  }

  const dateFmt = d3.timeParse("%m/%d/%Y");

  d3.csv(
    "projects.csv",
    function(d) {
      d.date = dateFmt(d.date);
      return d;
    },
    function(err, data) {
      if (err) throw err;
      updateComb(
        data.sort(function(a, b) {
          return (
            d3.ascending(a.rating, b.rating) || d3.ascending(a.date, b.date)
          );
        })
      );
    }
  );
})();
