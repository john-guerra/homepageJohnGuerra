(function Timeline() {
  /* global d3 */
  var svg = d3.select("#timeline"),
    margin = { top: 20, right: 0, bottom: 40, left: 0 },
    // width = (svg.node().width.baseVal.value||900) - margin.left - margin.right,
    width = 900 - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  var gData = g.append("g").attr("class", "data");
  var y = d3
    .scaleBand()
    .rangeRound([0, height])
    .paddingInner(0.05)
    .align(0.1);

  var x = d3.scaleTime();

  var color = d3.scaleOrdinal().range(["#507B94", "#86C6D7"]);
  var parseDate = d3.timeParse("%m/%Y");

  var xAxis = g
    .append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + (height) + ")");
  xAxis.append("path").attr("class", "base");

  function fnWidth(d) {
    return x(d.End) - x(d.Start) - 2;
  }

  function fnHeight(d) {
    return (y.bandwidth() - 1) * d.Height;
  }
  function fnX() {
    return 1;
  }
  function fnY(d) {
    return d.yOffset * fnHeight(d) + 1;
  }
  function fnColor(d) {
    return color(d.Type);
  }

  function update(data) {
    try {
      width =
        (d3
          .select("#timeline")
          .node()
          .getBoundingClientRect().width || 900) -
        margin.left -
        margin.right;
    } catch (e) {
      width = 900 - margin.left - margin.right;
    }

    x.domain([
      d3.min(data, function(d) {
        return d.Start;
      }),
      d3.max(data, function(d) {
        return d.End;
      }),
    ]).rangeRound([0, width]);
    y.domain(
      data.map(function(d) {
        return d.Type;
      })
    );
    // z.domain(keys);

    var entries = gData.selectAll(".entry").data(data);

    var entriesEnter = entries
      .enter()
      .append("g")
      .attr("class", "entry");

    entriesEnter.merge(entries).attr("transform", function(d) {
      return "translate(" + x(d.Start) + "," + y(d.Type) + ")";
    });

    entriesEnter
      .append("rect")
      .attr("rx", 2)
      .attr("ry", 2)
      .attr("width", 0)
      .merge(entries.select("rect"))
      .attr("x", fnX)
      .attr("y", fnY)

      .style("fill", fnColor)
      .attr("height", fnHeight)

      .transition()
      .duration(1000)
      .attr("width", fnWidth);

    entriesEnter
      .append("text")
      .text(function(d) {
        return d.Description;
      })
      .merge(entries.select("text"))
      .attr("x", function(d) {
        return fnX(d) + fnWidth(d) / 2;
      })
      .attr("y", function(d) {
        return fnY(d) + fnHeight(d) / 2 + 5;
      });

    xAxis
      .transition()
      .duration(2000)
      .call(function(sel) {
        sel.call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")));
        sel
          .selectAll("line")
          .attr("stroke", null)
          .attr("y1", -6);
      })
      .select(".base")
      .attr(
        "d",
        d3.line()([
          [0, 0],
          [width, 0],
        ])
      );
  }

  d3.csv(
    "experience.csv",
    function(d) {
      d.Start = parseDate(d.Start);
      d.End = d.End !== "-" ? parseDate(d.End) : new Date();
      return d;
    },
    function(error, data) {
      if (error) throw error;

      update(data);

      window.addEventListener("resize", function() {
        update(data);
      });
      // .on("resize", );
    }
  );
})();
