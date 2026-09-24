/* global d3 */

import { Runtime } from "https://cdn.jsdelivr.net/npm/@observablehq/runtime@5/dist/runtime.js";
import define from "https://api.observablehq.com/@john-guerra/scented-checkbox.js?v=3";

// Same visibility whitelist used by the honeycomb (js/projectsComb.js)
const NOTEBOOK_VISIBILITY = ["Public", "Team", "Published", "Shared"];

const dateFmt = d3.timeParse("%m/%d/%y");
const notebookDateFmt = d3.timeParse("%m/%d/%Y, %I:%M:%S %p");

// Mirrors the thumbnail resolution rule from js/projectsComb.js
function resolveThumb(thumb) {
  if (!thumb) return null;
  if (thumb.indexOf("http") === 0) return thumb;
  const parts = thumb.split(".");
  return "img/projs/" + parts[0] + "_small." + parts[1];
}

function loadData() {
  return Promise.all([d3.csv("projects.csv"), d3.csv("notebooks.csv")]).then(
    ([projects, notebooks]) => {
      const fromProjects = projects.map((d) => ({
        title: d.project,
        date: dateFmt(d.date) || new Date(0),
        category: d.categories || "Other",
        type: d.type || "professional",
        thumb: resolveThumb(d.thumb),
        url: d.url,
        rating: +d.rating || 1,
        source: "project",
      }));

      const fromNotebooks = notebooks
        .filter((n) => NOTEBOOK_VISIBILITY.includes(n.Visibility))
        .map((n) => ({
          title: n.Name,
          date: notebookDateFmt(n.timestamp) || new Date(0),
          category: "Notebook",
          type: "notebook",
          thumb: resolveThumb(n["Thumb-src"]),
          url: n["Link-href"],
          rating: +n.Likes > 3 ? 5 : 2,
          source: "notebook",
        }));

      return fromProjects.concat(fromNotebooks);
    }
  );
}

async function runProjectsGallery() {
  const notebook = new Runtime().module(define);
  const scentedCheckbox = await notebook.value("scentedCheckbox");

  const container = d3.select("#projectsGalleryContent");
  const countEl = d3.select("#projectsGalleryCount");
  const searchInput = document.querySelector("#gallerySearch");
  const minRatingSelect = document.querySelector("#galleryMinRating");
  const yearFromInput = document.querySelector("#galleryYearFrom");
  const yearToInput = document.querySelector("#galleryYearTo");

  let allData;
  try {
    allData = await loadData();
  } catch (err) {
    console.error("Failed to load projects gallery data", err);
    countEl.text("Could not load projects right now. Please try again later.");
    return;
  }

  let selectedTypes = [];
  let selectedCategories = [];
  let sortBy = "byDate";

  const years = allData.map((d) => d.date.getFullYear());
  yearFromInput.min = yearToInput.min = d3.min(years);
  yearFromInput.max = yearToInput.max = d3.max(years);
  yearFromInput.value = yearFromInput.min;
  yearToInput.value = yearToInput.max;

  const checkboxType = scentedCheckbox(allData, (d) => d.type, {
    label: "Type: ",
    showTotal: false,
  });
  selectedTypes = checkboxType.value;
  document.querySelector("#galleryFilters").append(checkboxType);

  const checkboxCategory = scentedCheckbox(allData, (d) => d.category, {
    label: "Category: ",
    showTotal: false,
  });
  selectedCategories = checkboxCategory.value;
  document.querySelector("#galleryFilters").append(checkboxCategory);

  checkboxType.addEventListener("change", () => {
    selectedTypes = checkboxType.value;
    reload();
  });
  checkboxCategory.addEventListener("change", () => {
    selectedCategories = checkboxCategory.value;
    reload();
  });
  searchInput.addEventListener("input", reload);
  minRatingSelect.addEventListener("change", reload);
  yearFromInput.addEventListener("change", reload);
  yearToInput.addEventListener("change", reload);
  document.querySelector("#gallerySortBy").addEventListener("change", (event) => {
    sortBy = event.target.id;
    reload();
  });

  const sorters = {
    byDate: (a, b) => d3.descending(a.date, b.date),
    byRating: (a, b) => d3.descending(a.rating, b.rating),
    byTitle: (a, b) => d3.ascending(a.title, b.title),
  };

  function reload() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const minRating = +minRatingSelect.value;
    const yearFrom = +yearFromInput.value;
    const yearTo = +yearToInput.value;

    const filtered = allData
      .filter((d) => selectedTypes.includes(d.type))
      .filter((d) => selectedCategories.includes(d.category))
      .filter((d) => d.rating >= minRating)
      .filter((d) => {
        const year = d.date.getFullYear();
        return year >= yearFrom && year <= yearTo;
      })
      .filter(
        (d) => !searchTerm || d.title.toLowerCase().includes(searchTerm)
      )
      .sort(sorters[sortBy]);

    countEl.text(filtered.length + " project" + (filtered.length === 1 ? "" : "s"));

    const cards = container.selectAll(".gallery-card").data(filtered, (d) => d.source + "|" + d.url + "|" + d.title);

    cards.exit().remove();

    const cardsEnter = cards
      .enter()
      .append("a")
      .attr("class", "gallery-card")
      .attr("target", "_blank");

    cardsEnter
      .append("div")
      .attr("class", "gallery-thumb");

    cardsEnter.append("div").attr("class", "gallery-title");
    cardsEnter.append("div").attr("class", "gallery-meta");

    const cardsMerged = cardsEnter.merge(cards);

    cardsMerged.attr("href", (d) => d.url);

    cardsMerged
      .select(".gallery-thumb")
      .html("")
      .each(function(d) {
        const el = d3.select(this);
        if (d.thumb) {
          el.classed("no-thumb", false).append("img").attr("src", d.thumb).attr("alt", d.title);
        } else {
          el.classed("no-thumb", true).text(d.title.charAt(0));
        }
      });

    cardsMerged.select(".gallery-title").text((d) => d.title);

    cardsMerged
      .select(".gallery-meta")
      .html("")
      .each(function(d) {
        const meta = d3.select(this);
        // Notebooks share the same value for category and type, so only show one badge
        if (d.category.toLowerCase() !== d.type.toLowerCase()) {
          meta.append("span").attr("class", "badge-category").text(d.category);
        }
        meta.append("span").attr("class", "badge-type").text(d.type);
        meta.append("span").attr("class", "gallery-rating").text("★".repeat(d.rating));
      });
  }

  reload();
}

runProjectsGallery();
