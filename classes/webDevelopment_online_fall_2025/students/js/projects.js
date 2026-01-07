/* globals d3 */

/**
 * CS 5610 Web Development - Student Projects
 * D3.js script with filtering, view toggle, and collapsible sections
 */

/**
 * Debounce utility function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

let urlCSV =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJYNICkdnoLWFXS4fg7CwSA1lGc0vaFVnyn9TZbQRUqhOjPyKCCC2Y25Su0unjIviuKgi0i3hE01J8/pub?gid=1228114978&single=true&output=csv";
const container = d3.select("#projects");

/**
 * Application State
 */
const State = {
  allData: [],
  filteredData: [],
  viewMode: "detailed", // 'detailed' or 'compact'
  selectedStudents: [],
  searchQuery: "", // Track search query for URL persistence
  collapsedSections: new Set(),
};

/**
 * Read state from URL parameters
 */
function readStateFromURL() {
  const params = new URLSearchParams(window.location.search);

  // View mode
  const view = params.get("view");
  if (view === "compact" || view === "detailed") {
    State.viewMode = view;
  }

  // Search query
  const search = params.get("search");
  if (search) {
    State.searchQuery = search;
  }

  // Collapsed sections
  const collapsed = params.get("collapsed");
  if (collapsed) {
    collapsed.split(",").forEach((section) => {
      if (section) State.collapsedSections.add(decodeURIComponent(section));
    });
  }
}

/**
 * Update URL with current state (without page reload)
 */
function updateURL() {
  const params = new URLSearchParams();

  // Only add non-default values
  if (State.viewMode !== "detailed") {
    params.set("view", State.viewMode);
  }

  if (State.searchQuery) {
    params.set("search", State.searchQuery);
  }

  if (State.collapsedSections.size > 0) {
    const collapsed = Array.from(State.collapsedSections)
      .map((s) => encodeURIComponent(s))
      .join(",");
    params.set("collapsed", collapsed);
  }

  // Build new URL
  const newURL =
    params.toString() === ""
      ? window.location.pathname
      : window.location.pathname + "?" + params.toString();

  // Update URL without reload
  window.history.replaceState({}, "", newURL);
}

/**
 * Project field constants
 */
const Project = {
  THUMBNAIL: "Project Thumbnail URL",
};

/**
 * SVG Icons
 */
const Icons = {
  code: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M5.854 4.854a.5.5 0 1 0-.708-.708l-3.5 3.5a.5.5 0 0 0 0 .708l3.5 3.5a.5.5 0 0 0 .708-.708L2.707 8l3.147-3.146zm4.292 0a.5.5 0 0 1 .708-.708l3.5 3.5a.5.5 0 0 1 0 .708l-3.5 3.5a.5.5 0 0 1-.708-.708L13.293 8l-3.147-3.146z"/></svg>`,
  demo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm7.5-6.923c-.67.204-1.335.82-1.887 1.855A7.97 7.97 0 0 0 5.145 4H7.5V1.077zM4.09 4a9.267 9.267 0 0 1 .64-1.539 6.7 6.7 0 0 1 .597-.933A7.025 7.025 0 0 0 2.255 4H4.09zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a6.958 6.958 0 0 0-.656 2.5h2.49zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5H4.847zM8.5 5v2.5h2.99a12.495 12.495 0 0 0-.337-2.5H8.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5H4.51zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5H8.5zM5.145 12c.138.386.295.744.468 1.068.552 1.035 1.218 1.65 1.887 1.855V12H5.145zm.182 2.472a6.696 6.696 0 0 1-.597-.933A9.268 9.268 0 0 1 4.09 12H2.255a7.024 7.024 0 0 0 3.072 2.472zM3.82 11a13.652 13.652 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5H3.82zm6.853 3.472A7.024 7.024 0 0 0 13.745 12H11.91a9.27 9.27 0 0 1-.64 1.539 6.688 6.688 0 0 1-.597.933zM8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855.173-.324.33-.682.468-1.068H8.5zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.65 13.65 0 0 1-.312 2.5zm2.802-3.5a6.959 6.959 0 0 0-.656-2.5H12.18c.174.782.282 1.623.312 2.5h2.49zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7.024 7.024 0 0 0-3.072-2.472c.218.284.418.598.597.933zM10.855 4a7.966 7.966 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4h2.355z"/></svg>`,
  video: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814l-3.5-2.5z"/><path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/></svg>`,
  slides: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M0 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3zm2-1a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H2z"/><path d="M3 5.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 8zm0 2.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5z"/></svg>`,
  chevron: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="chevron"><path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/></svg>`,
};

/**
 * Extract unique student names from data
 */
function getStudentNames(data) {
  const names = new Set();
  data.forEach((d) => {
    if (d["Full Name Student 1"]) {
      names.add(d["Full Name Student 1"]);
    }
    if (d["Full Name Student 2"] && d["University ID Number Student 2"] !== d["University ID Number Student 1"]) {
      names.add(d["Full Name Student 2"]);
    }
  });
  return Array.from(names).sort();
}

/**
 * Filter data based on selected students
 */
function filterData() {
  if (State.selectedStudents.length === 0) {
    State.filteredData = State.allData;
  } else {
    State.filteredData = State.allData.filter((d) => {
      const student1 = d["Full Name Student 1"];
      const student2 = d["Full Name Student 2"];
      return (
        State.selectedStudents.includes(student1) ||
        State.selectedStudents.includes(student2)
      );
    });
  }
}

/**
 * Toggle section collapse state
 */
function toggleSection(sectionKey) {
  if (State.collapsedSections.has(sectionKey)) {
    State.collapsedSections.delete(sectionKey);
  } else {
    State.collapsedSections.add(sectionKey);
  }
  // Update DOM
  const topic = container.select(`.topic[data-section="${sectionKey}"]`);
  topic.classed("collapsed", State.collapsedSections.has(sectionKey));
  updateURL();
}

/**
 * Expand all sections
 */
function expandAll() {
  State.collapsedSections.clear();
  container.selectAll(".topic").classed("collapsed", false);
  updateURL();
}

/**
 * Collapse all sections
 */
function collapseAll() {
  container.selectAll(".topic").each(function (d) {
    State.collapsedSections.add(d.key);
  });
  container.selectAll(".topic").classed("collapsed", true);
  updateURL();
}

/**
 * Scroll parallax state
 */
let scrollParallaxInitialized = false;

/**
 * Update parallax effect based on scroll position
 */
function updateScrollParallax() {
  if (State.viewMode !== "compact") return;

  const cards = document.querySelectorAll(".compact-view .project-card");
  const viewportHeight = window.innerHeight;

  cards.forEach(function (card) {
    const rect = card.getBoundingClientRect();
    const cardCenter = rect.top + rect.height / 2;

    // Calculate position relative to viewport center (0 = center, -1 = top, 1 = bottom)
    const relativePosition = (cardCenter - viewportHeight / 2) / (viewportHeight / 2);

    // Map to background position (30% to 70% range for subtle effect)
    const bgPosition = 50 + relativePosition * 20;

    card.style.setProperty("--scroll-bg-position", bgPosition + "%");
  });
}

/**
 * Initialize scroll-based parallax
 */
function initScrollParallax() {
  if (scrollParallaxInitialized) return;
  scrollParallaxInitialized = true;

  // Use passive event listener for better performance
  window.addEventListener("scroll", updateScrollParallax, { passive: true });
  window.addEventListener("resize", updateScrollParallax, { passive: true });
}

/**
 * Set view mode and re-render
 */
function setViewMode(mode) {
  State.viewMode = mode;

  // Update button states
  document.querySelectorAll(".btn-view").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === mode);
  });

  // Update container class
  container.classed("compact-view", mode === "compact");
  updateURL();
}

/**
 * Renders the project data into the DOM
 */
function render() {
  // Clear existing content
  container.html("");

  // Update view mode class
  container.classed("compact-view", State.viewMode === "compact");

  // Show "no results" message if filtered data is empty
  if (State.filteredData.length === 0) {
    container.append("div")
      .attr("class", "no-results")
      .html(`<p>No projects found matching your search.</p><p class="text-muted">Try a different search term.</p>`);
    return;
  }

  // Nest data by project type
  const nestedData = d3
    .nest()
    .key((d) => d["Project"])
    .entries(State.filteredData)
    .sort((a, b) => d3.ascending(a.key, b.key));

  // Create topic sections
  const topics = container
    .selectAll(".topic")
    .data(nestedData)
    .enter()
    .append("div")
    .attr("class", (d) =>
      State.collapsedSections.has(d.key) ? "topic collapsed" : "topic"
    )
    .attr("data-section", (d) => d.key);

  // Add clickable section header
  const headers = topics.append("div").attr("class", "topic-header");

  headers.html(
    (d) =>
      `${Icons.chevron}<h3>${d.key}</h3><span class="project-count">${d.values.length} projects</span>`
  );

  headers.on("click", function (d) {
    toggleSection(d.key);
  });

  // Create grid container for cards
  const grids = topics.append("div").attr("class", "projects-grid");

  // Create project cards
  const cards = grids
    .selectAll(".project-card")
    .data((d) =>
      d.values.sort((a, b) =>
        d3.ascending(a["First name Student 1"], b["First name Student 1"])
      )
    )
    .enter()
    .append("div")
    .attr("class", "project-card")
    .style("--thumbnail-url", (d) =>
      d[Project.THUMBNAIL] ? `url(${d[Project.THUMBNAIL]})` : "none"
    );

  // Thumbnail (only shown in detailed view via CSS)
  const thumb = cards.append("div").attr("class", "project-thumb");

  thumb
    .append("a")
    .attr("href", (d) => d["Project URL"] || d["Github repo URL"])
    .attr("target", "_blank")
    .attr("rel", "noopener noreferrer")
    .append("img")
    .attr("src", (d) => d[Project.THUMBNAIL] || "")
    .attr("alt", (d) => `${d["Full Name Student 1"]} - ${d["Project Name"]}`)
    .attr("loading", "lazy")
    .on("error", function () {
      d3.select(this).style("display", "none");
    });

  // Card body
  const cardBody = cards.append("div").attr("class", "project-card-body");

  // Project info
  const info = cardBody.append("div").attr("class", "project-info");

  // Student 1 name
  const studentName = info.append("div").attr("class", "student-name");

  studentName
    .append("a")
    .attr("href", (d) => d["Personal homepage URL 1"])
    .attr("target", "_blank")
    .attr("rel", "noopener noreferrer")
    .text((d) => d["Full Name Student 1"]);

  // Student 2 name (if exists)
  info
    .filter(
      (d) =>
        d["University ID Number Student 2"] &&
        d["University ID Number Student 2"] !== d["University ID Number Student 1"]
    )
    .append("div")
    .attr("class", "student-name-secondary")
    .append("a")
    .attr("href", (d) => d["Personal homepage URL 2"])
    .attr("target", "_blank")
    .attr("rel", "noopener noreferrer")
    .text((d) => d["Full Name Student 2"]);

  // Project name
  info
    .append("p")
    .attr("class", "project-name")
    .text((d) => d["Project Name"]);

  // Action links
  const actions = cardBody.append("div").attr("class", "project-actions");

  actions
    .filter((d) => d["Github repo URL"])
    .append("a")
    .attr("class", "action-code")
    .attr("href", (d) => d["Github repo URL"])
    .attr("target", "_blank")
    .attr("rel", "noopener noreferrer")
    .attr("title", "View Code")
    .html(Icons.code + `<span class="btn-label">Code</span>`);

  actions
    .filter((d) => d["Project URL"])
    .append("a")
    .attr("class", "action-demo")
    .attr("href", (d) => d["Project URL"])
    .attr("target", "_blank")
    .attr("rel", "noopener noreferrer")
    .attr("title", "View Demo")
    .html(Icons.demo + `<span class="btn-label">Demo</span>`);

  actions
    .filter((d) => d["Public video URL"])
    .append("a")
    .attr("class", "action-video")
    .attr("href", (d) => d["Public video URL"])
    .attr("target", "_blank")
    .attr("rel", "noopener noreferrer")
    .attr("title", "Watch Video")
    .html(Icons.video + `<span class="btn-label">Video</span>`);

  actions
    .filter((d) => d["Google Slides URL"])
    .append("a")
    .attr("class", "action-slides")
    .attr("href", (d) => d["Google Slides URL"])
    .attr("target", "_blank")
    .attr("rel", "noopener noreferrer")
    .attr("title", "View Slides")
    .html(Icons.slides + `<span class="btn-label">Slides</span>`);

  // Update scroll parallax positions after render
  updateScrollParallax();
}

/**
 * Initialize the student search filter
 */
function initSearch() {
  const searchContainer = document.getElementById("student-search");
  if (!searchContainer) return;

  const studentNames = getStudentNames(State.allData);

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Search students...";

  // Restore search from URL state
  if (State.searchQuery) {
    input.value = State.searchQuery;
    State.selectedStudents = studentNames.filter((name) =>
      name.toLowerCase().includes(State.searchQuery.toLowerCase())
    );
    filterData();
  }

  const handleSearch = debounce(function (query) {
    State.searchQuery = query;
    if (query === "") {
      State.selectedStudents = [];
    } else {
      State.selectedStudents = studentNames.filter((name) =>
        name.toLowerCase().includes(query)
      );
    }
    filterData();
    render();
    updateURL();
  }, 300);

  input.addEventListener("input", function () {
    handleSearch(this.value.toLowerCase().trim());
  });

  searchContainer.appendChild(input);
}

/**
 * Initialize view toggle buttons
 */
function initViewToggle() {
  document.querySelectorAll(".btn-view").forEach((btn) => {
    btn.addEventListener("click", function () {
      setViewMode(this.dataset.view);
    });
  });
}

/**
 * Initialize fold/unfold controls
 */
function initFoldControls() {
  const expandBtn = document.getElementById("expand-all");
  const collapseBtn = document.getElementById("collapse-all");

  if (expandBtn) {
    expandBtn.addEventListener("click", expandAll);
  }
  if (collapseBtn) {
    collapseBtn.addEventListener("click", collapseAll);
  }
}

/**
 * Pre-processes raw data from spreadsheet
 */
function preProcess(data) {
  const dictStudentProj = {};

  data
    .filter(
      (d) =>
        d.Disabled === null || d.Disabled === undefined || d.Disabled === ""
    )
    .map((d) => {
      d["Timestamp"] = new Date(d["Timestamp"]);
      return d;
    })
    .sort((a, b) => d3.ascending(a["Timestamp"], b["Timestamp"]))
    .forEach((d) => {
      dictStudentProj[d["Project"] + d["University ID Number Student 1"]] = d;
    });

  return d3.values(dictStudentProj);
}

/**
 * Initialize the application
 */
function init(data) {
  // Read state from URL before processing data
  readStateFromURL();

  State.allData = preProcess(data);
  State.filteredData = State.allData;

  // Set dynamic footer year
  const footerYear = document.getElementById("footer-year");
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }

  // Initialize UI components
  initSearch();
  initViewToggle();
  initFoldControls();

  // Apply restored view mode to UI
  document.querySelectorAll(".btn-view").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === State.viewMode);
  });

  // Initialize scroll parallax
  initScrollParallax();

  // Initial render
  render();
}

// Load data from Google Sheets CSV
d3.csv(urlCSV, (err, data) => {
  if (err) {
    console.error("Error loading data:", err);
    container.html(
      "<p class=\"text-center text-danger\">Error loading projects. Please try again later.</p>"
    );
    return;
  }

  init(data);
});
