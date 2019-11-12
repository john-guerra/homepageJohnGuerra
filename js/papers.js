/* global d3 */
var container = d3.select("#papers");
container.html("");
var timeFmt = d3.timeParse("%m/%d/%Y");
var color = d3.scaleOrdinal(d3.schemeCategory10);

d3.json("papers.json", function(err, papers) {
  if (err) throw err;

  papers.forEach(function(d) {
    d.date = timeFmt(d.date);
    d.authors = d.authors.replace(
      "John Alexis Guerra-Gomez",
      "<strong>John Alexis Guerra-Gomez</strong>"
    );
  });

  var hideCategories = [
    "Presentation",
    "Tech Report",
    "Software",
    "Trademark",
    "Panel"
  ];
  const categoriesOrder = {
    Visualization: 0,
    "Tree Visualization": 1,
    "Photo Visualization": 2,
    "Network Visualization": 3,
    "Time Visualization": 6,
    Accessibility: 5,
    Other: 4
  };

  var filteredPapers = papers.filter(function(d) {
    return hideCategories.indexOf(d.type) === -1;
  });

  var sortByDate = function(a, b) {
    return d3.descending(a.date, b.date);
  };

  var nestedPapers = d3
    .nest()
    .key(function(d) {
      return d.category;
    })
    .entries(filteredPapers.sort(sortByDate))
    .sort((a, b) =>
      d3.ascending(categoriesOrder[a.key], categoriesOrder[b.key])
    );

  container
    .append("h2")
    .text("Publications" + " (" + filteredPapers.length + ")");

  const row = container.append("div").attr("class", "row");
  var papersSel = row.selectAll(".category").data(nestedPapers);

  var catSel = papersSel
    .enter()
    .append("div")
    .attr("class", "category col-md-6");
  // .style("page-break-before", "always");

  catSel.append("h3").text(function(d) {
    return d.key + " (" + d.values.length + ")";
  });

  var paperSel = catSel
    .selectAll(".paper")
    .data(function(d) {
      return d.values;
    })
    .enter()
    .append("div")
    .attr("class", "paper");

  paperSel
    .append("div")
    .attr("class", "year")
    .text(function(d) {
      return d.year;
    });

  var paperContentSel = paperSel.append("div").attr("class", "paper-content");

  paperSel.append("div").attr("class", "clearer");

  paperContentSel
    .append("a")
    .attr("class", "title")
    .attr("href", function(d) {
      return d.link;
    })
    .text(function(d) {
      return d.title;
    });

  paperContentSel
    .append("div")
    .attr("class", "authors")
    .html(function(d) {
      return d.authors;
    });

  paperContentSel
    .append("div")
    .attr("class", "venue")
    .text(function(d) {
      return d.venue;
    });

  paperContentSel
    .append("div")
    .attr("class", "type")
    .style("color", function(d) {
      return color(d.type);
    })
    .text(function(d) {
      return d.type;
    });

  catSel.append("div").attr("class", "clearer");
});
