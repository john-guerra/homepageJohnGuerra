/* global d3 */

import { Runtime } from "https://cdn.jsdelivr.net/npm/@observablehq/runtime@5/dist/runtime.js";
import define from "https://api.observablehq.com/@john-guerra/scented-checkbox.js?v=3";

async function runPapers() {
  const notebook = new Runtime().module(define);
  const scentedCheckbox = await notebook.value("scentedCheckbox");

  let container = d3.select("#papersContent");
  container.html("");
  let timeFmt = d3.timeParse("%m/%d/%Y");
  let color = d3.scaleOrdinal(d3.schemeCategory10);

  d3.json("papers.json", function(err, papers) {
    if (err) throw err;

    let orderBy = "byDate";
    let selectedTypes = [];
    let selectedCategories = [];

    papers.forEach(function(d) {
      d.date = timeFmt(d.date);
      d.authors =
        d.authors &&
        typeof d.authors?.replace === "function" &&
        d.authors.replace(
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

    const h2Container = container.append("h2");

    createCheckboxes();

    const formOrderBy = d3
      .select("#orderBy")
      // .append("form")
      // .attr("class", "form-check")
      // .html(
      //   `
      //   <form id="orderBy">
      // 			Order by:
      // 			<label class="form-check-label"
      // 				><input
      // 					class="form-check-input"
      // 					type="radio"
      // 					name="papersOrderBy"
      // 					id="byDate"
      // 					checked
      // 				/>
      // 				Date</label
      // 			>
      // 			<label class="form-check-label"
      // 				><input
      // 					class="form-check-input"
      // 					type="radio"
      // 					name="papersOrderBy"
      // 					id="category"
      // 				/>
      // 				Category</label
      // 			>

      // 			<label class="form-check-label"
      // 				><input
      // 					class="form-check-input"
      // 					type="radio"
      // 					name="papersOrderBy"
      // 					id="type"
      // 				/>
      // 				Type</label
      // 			>
      // 		</form>
      // `
      // )
      .on("change", onChangeOrderBy);

    const row = container.append("div").attr("class", "row");

    reload();

    function createCheckboxes() {
      const checkboxType = scentedCheckbox(filteredPapers, (d) => d.type, {
        label: "Type: ",
        showTotal: false,
      });
      selectedTypes = checkboxType.value;
      document.querySelector("#papersFilters").append(checkboxType);

      const checkboxCategory = scentedCheckbox(
        filteredPapers,
        (d) => d.category,
        {
          label: "Category: ",
          showTotal: false,
        }
      );
      selectedCategories = checkboxCategory.value;
      document.querySelector("#papersFilters").append(checkboxCategory);
      checkboxType.addEventListener("change", () => {
        selectedTypes = checkboxType.value;
        reload();
      });
      checkboxCategory.addEventListener("change", () => {
        selectedCategories = checkboxCategory.value;
        reload();
      });
    }

    function onChangeOrderBy() {
      console.log("evt", d3.event.target.id);

      orderBy = d3.event.target.id;

      reload();
    }

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

      const paperContentSelTypeCat = paperContentSel
        .append("div")
        .classed("type-cat", true);

      paperContentSelTypeCat
        .append("span")
        .attr("class", "type")
        .style("color", function(d) {
          return color(d.type);
        })
        .text(function(d) {
          return d.type;
        });

      paperContentSelTypeCat
        .append("span")
        .attr("class", "category")
        .text((d) => `Category: ${d.category}`);
    }

    function reload() {
      filteredPapers = papers.filter(
        (d) =>
          selectedTypes.includes(d.type) &&
          selectedCategories.includes(d.category)
      );

      h2Container.text("Publications" + " (" + filteredPapers.length + ")");

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
        .attr(
          "class",
          `category ${orderBy === "byDate" ? "col-12" : "col-md-6 col-sm-12"}`
        );
      // .style("page-break-before", "always");

      catSelMerged.exit().remove();

      // Only draw category header if orderBy is byCategory
      if (orderBy !== "byDate") renderCategoryHeader(catSelMerged);
      renderPapers(catSelMerged);

      catSelMerged.append("div").attr("class", "clearer");
    }
  });
}

runPapers();
