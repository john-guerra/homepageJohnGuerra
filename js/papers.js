/* global d3 */
let container = d3.select("#papers");
container.html("");
let timeFmt = d3.timeParse("%m/%d/%Y");
let color = d3.scaleOrdinal(d3.schemeCategory10);

d3.json("papers.json", function(err, papers) {
  if (err) throw err;

  let orderBy = "byDate";

  papers.forEach(function(d) {
    d.date = timeFmt(d.date);
    d.authors = d.authors.replace(
      "John Alexis Guerra-Gomez",
      "<strong>John Alexis Guerra-Gomez</strong>"
    );
  });

  let hideCategories = [
    "Presentation",
    "Tech Report",
    "Software",
    "Trademark",
    "Panel",
  ];
  const categoriesOrder = {
    Visualization: 0,
    "Tree Visualization": 1,
    "Photo Visualization": 2,
    "Network Visualization": 3,
    "Time Visualization": 6,
    Accessibility: 5,
    Other: 4,
  };

  let filteredPapers = papers.filter(function(d) {
    return hideCategories.indexOf(d.type) === -1;
  });

  let sortByDate = function(a, b) {
    return d3.descending(a.date, b.date);
  };

  container
    .append("h2")
    .text("Publications" + " (" + filteredPapers.length + ")");

  function onChangeOrderBy() {
    console.log("evt", d3.event.target.id);

    orderBy = d3.event.target.id;

    reload();
  }

  const formOrderBy = d3
    .select("#orderBy")
    .append("form")
    .attr("class", "form-check")
    .html(
      `
      <form id="orderBy">
					Order by:
					<label class="form-check-label"
						><input
							class="form-check-input"
							type="radio"
							name="papersOrderBy"
							id="byDate"
							checked
						/>
						Date</label
					>
					<label class="form-check-label"
						><input
							class="form-check-input"
							type="radio"
							name="papersOrderBy"
							id="category"
						/>
						Category</label
					>
	
					<label class="form-check-label"
						><input
							class="form-check-input"
							type="radio"
							name="papersOrderBy"
							id="type"
						/>
						Type</label
					>
				</form>
    `
    )
    .on("change", onChangeOrderBy);

  const row = container.append("div").attr("class", "row");

  function renderCategoryHeader(catSelMerged) {
    const catSelMergedH3 = catSelMerged.selectAll("h3").data((d) => [d]);
    catSelMergedH3
      .enter()
      .append("h3")
      .merge(catSelMergedH3)
      .text(function(d) {
        return d.key + " (" + d.values.length + ")";
      });
    catSelMergedH3.exit().remove();
  }

  function renderPapers(catSelMerged) {
    // Render papers
    let paperSel = catSelMerged.selectAll(".paper").data(function(d) {
      return d.values;
    });

    const paperSelMerged = paperSel
      .enter()
      .append("div")
      .merge(paperSel)
      .attr("class", "paper");

    paperSelMerged
      .append("div")
      .attr("class", "year")
      .text(function(d) {
        return d.year;
      });

    let paperContentSel = paperSelMerged
      .append("div")
      .attr("class", "paper-content");

    paperSelMerged.append("div").attr("class", "clearer");

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
  }

  function reload() {
    let nestedPapers = d3
      .nest()
      .key((d) => (orderBy === "byDate" ? "" : d[orderBy]))
      .entries(filteredPapers.sort(sortByDate))
      .sort((a, b) =>
        d3.ascending(categoriesOrder[a.key], categoriesOrder[b.key])
      );

    nestedPapers.map((d) => {
      d.values = d.values.sort((a, b) =>
        d3.ascending(categoriesOrder[a.date], categoriesOrder[b.date])
      );
    });

    row.html("");

    let catSel = row.selectAll(".category").data(nestedPapers);

    let catSelMerged = catSel.enter().append("div");

    catSelMerged
      .merge(catSel)
      .attr("class", `category ${orderBy === "byDate" ? "col-12" : "col-6"}`);
    // .style("page-break-before", "always");

    catSelMerged.exit().remove();

    // Only draw category header if orderBy is byCategory
    if (orderBy !== "byDate") renderCategoryHeader(catSelMerged);
    renderPapers(catSelMerged);

    catSelMerged.append("div").attr("class", "clearer");
  }

  reload();
});
