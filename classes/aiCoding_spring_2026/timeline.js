/**
 * CourseTimeline - A Reactive Widget for CS 7180 Course Schedule
 * Follows the Reactive Widgets pattern: https://reactivewidgets.com/
 */

// Color palette based on d3.schemePaired, avoiding red (too intense)
// Pairs: blue, green, purple, orange - differentiable and harmonious
const colorPalette = {
  blue: { dark: "#1f78b4", light: "#a6cee3" },
  green: { dark: "#33a02c", light: "#b2df8a" },
  purple: { dark: "#6a3d9a", light: "#cab2d6" },
  orange: { dark: "#ff7f00", light: "#fdbf6f" },
};

// Course data extracted from schedule.md
const courseData = {
  semester: {
    startDate: "2026-01-05", // Week 1 Monday (calendar week containing semester start)
    totalWeeks: 15,
  },
  phases: [
    { name: "Fundamentals", weeks: [1, 3], color: colorPalette.blue.dark },
    { name: "Claude Web", weeks: [3, 6], color: colorPalette.green.dark },
    { name: "IDE Assistants", weeks: [6, 10], color: colorPalette.purple.dark },
    { name: "CLI Agentic", weeks: [10, 15], color: colorPalette.orange.dark },
  ],
  projects: [
    {
      id: "P1",
      name: "Personal Utility",
      startWeek: 3,
      endWeek: 6,
      weight: "15%",
      color: colorPalette.green.dark,
    },
    {
      id: "P2",
      name: "Full-Stack App",
      startWeek: 6,
      endWeek: 10,
      weight: "20%",
      color: colorPalette.purple.dark,
    },
    {
      id: "P3",
      name: "Team App",
      startWeek: 10,
      endWeek: 15,
      weight: "20%",
      color: colorPalette.orange.dark,
    },
  ],
  homeworks: [
    { id: "HW1", name: "Prompt Engineering", dueWeek: 4, weight: "4%" },
    { id: "HW2", name: "Mom Test", dueWeek: 5, weight: "4%" },
    { id: "HW3", name: "Context Engineering", dueWeek: 8, weight: "4%" },
    { id: "HW4", name: "TDD + CI/CD", dueWeek: 10, weight: "5%" },
    { id: "HW5", name: "Parallel Agents", dueWeek: 11, weight: "4%" },
    { id: "HW6", name: "Production Ready", dueWeek: 13, weight: "4%" },
  ],
  weeklyFocus: {
    1: {
      topic: "Course Intro & LLM Fundamentals",
      project: "P1: Ideation",
      action: "Identify a problem to solve",
    },
    2: {
      topic: "LLM Architecture & Tokenization",
      project: "P1: User Research",
      action: "Start Mom Test interviews",
    },
    3: {
      topic: "Prompt Engineering Basics",
      project: "P1: PRD & Architecture",
      action: "Write user stories",
    },
    4: {
      topic: "Claude Web & Artifacts",
      project: "P1: Prototyping",
      action: "Complete HW1, build prototype",
    },
    5: {
      topic: "Claude Projects & Iteration",
      project: "P1: Refinement",
      action: "Complete HW2, refine prototype",
    },
    6: {
      topic: "P1 Due & IDE-Centric AI Coding",
      project: "P1: Final, P2: Start",
      action: "Submit P1, start P2",
    },
    7: {
      topic: "Advanced IDE AI + Agile/Scrum",
      project: "P2: Sprint 1",
      action: "Set up scrumboard, start P2 sprints",
    },
    8: {
      topic: "Claude Code (Modality 3)",
      project: "P2: Sprint 2",
      action: "Complete HW3, continue P2",
    },
    9: {
      topic: "Spring Break",
      project: "No Class",
      action: "Rest and catch up on projects",
    },
    10: {
      topic: "P2 Due & TDD + Evals",
      project: "P2: Final, P3: Start",
      action: "Complete HW4, submit P2, form teams",
    },
    11: {
      topic: "CI/CD Fundamentals",
      project: "P3: Sprint 1",
      action: "Complete HW5, set up CI/CD pipelines",
    },
    12: {
      topic: "Claude Code + Parallel Agents",
      project: "P3: Sprint 2",
      action: "Complete HW5, parallel development",
    },
    13: {
      topic: "Advanced Patterns + Production",
      project: "P3: Sprint 3",
      action: "Complete HW6, advanced features",
    },
    14: {
      topic: "Production Polish",
      project: "P3: Sprint 4",
      action: "Deploy & polish, demo prep",
    },
    15: {
      topic: "Demo Day",
      project: "P3: Final Demo",
      action: "Present P3, celebrate!",
    },
  },
};

/**
 * Calculate current week number from a date
 * @param {Date} date - The date to convert
 * @returns {number} Week number (1-15, clamped)
 */
function dateToWeek(date) {
  const start = new Date(courseData.semester.startDate);
  const diffDays = (date - start) / (1000 * 60 * 60 * 24);
  return Math.max(1, Math.min(15, Math.ceil(diffDays / 7)));
}

/**
 * ReactiveWidget helper - wraps an element to make it reactive
 */
function ReactiveWidget(target, { showValue = () => {}, value } = {}) {
  let internalValue = value;

  function setValue(newValue) {
    internalValue = newValue;
    target.dispatchEvent(new CustomEvent("input", { bubbles: true }));
  }

  Object.defineProperty(target, "value", {
    get() {
      return internalValue;
    },
    set(newValue) {
      internalValue = newValue;
      showValue();
    },
  });

  target.addEventListener("input", (evt) => {
    evt.stopPropagation();
    evt.preventDefault();
    showValue(evt);
  });

  target.setValue = setValue;
  return target;
}

/**
 * CourseTimeline - Main widget function
 * @param {Object} data - Course data object
 * @param {Object} options - Widget options
 * @param {number} options.value - Initial selected week (defaults to current week)
 * @returns {HTMLElement} Reactive widget element with value property (auto-resizes to container width)
 */
function CourseTimeline(data, { value = dateToWeek(new Date()) } = {}) {
  let widget;
  const margin = { top: 30, right: 30, bottom: 15, left: 85 }; // Increased left for labels, reduced top/bottom
  const height = 200; // Reduced from 260

  // Create container
  const container = document.createElement("div");
  container.className = "course-timeline-widget";

  // Focus card
  const focusCard = document.createElement("div");
  focusCard.className = "focus-card";
  container.appendChild(focusCard);

  // SVG container
  const svgContainer = document.createElement("div");
  svgContainer.style.width = "100%";
  container.appendChild(svgContainer);

  // Use fixed internal width with viewBox for responsive scaling
  const width = 800;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Create SVG with viewBox for responsive scaling
  const svg = d3
    .select(svgContainer)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100%")
    .style("height", "auto");

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Scales
  const xScale = d3.scaleLinear().domain([1, 15]).range([0, innerWidth]);

  // Layout constants - tighter vertical spacing
  const phaseHeight = 26;
  const projectY = phaseHeight + 12;
  const projectHeight = 22;
  const hwY = projectY + projectHeight + 18;
  const axisY = hwY + 22;

  // Y-axis labels (italic, positioned further left to avoid overlap)
  const yLabels = [
    { y: phaseHeight / 2, text: "Modality" },
    { y: projectY + projectHeight / 2, text: "Projects" },
    { y: hwY, text: "Homeworks" },
    { y: axisY, text: "Week" },
  ];

  const labelsGroup = g.append("g").attr("class", "y-labels");
  yLabels.forEach((label) => {
    labelsGroup
      .append("text")
      .attr("x", -18)
      .attr("y", label.y)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .attr("font-size", "10px")
      .attr("font-style", "italic")
      .attr("fill", "#6c757d")
      .text(label.text);
  });

  // Draw week axis grid lines FIRST (behind everything)
  const axisGroup = g.append("g").attr("class", "axis-group");

  // Spring Break shading (Week 9: March 2-8, 2026)
  const springBreakWeek = 9;
  const sbX1 = xScale(springBreakWeek);
  const sbX2 = xScale(springBreakWeek + 1);
  axisGroup
    .append("rect")
    .attr("class", "spring-break-bg")
    .attr("x", sbX1)
    .attr("y", -10)
    .attr("width", sbX2 - sbX1)
    .attr("height", axisY + 20)
    .attr("fill", "#e9ecef")
    .attr("opacity", 0.7);

  // Spring Break label (rotated, subtle)
  axisGroup
    .append("text")
    .attr("class", "spring-break-label")
    .attr("x", xScale(springBreakWeek + 0.5))
    .attr("y", axisY + 12)
    .attr("text-anchor", "middle")
    .attr("font-size", "8px")
    .attr("fill", "#6c757d")
    .attr("font-style", "italic")
    .text("Spring Break");

  for (let i = 1; i <= 15; i++) {
    const x = xScale(i);

    // Grid lines extend from top of modality row to bottom
    axisGroup
      .append("line")
      .attr("class", `week-grid-${i}`)
      .attr("x1", x)
      .attr("y1", 0)
      .attr("x2", x)
      .attr("y2", axisY - 10)
      .attr("stroke", "#dee2e6")
      .attr("stroke-dasharray", "2,2");

    axisGroup
      .append("text")
      .attr("class", `week-label-${i}`)
      .attr("x", x + innerWidth / 14 / 2)
      .attr("y", axisY)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("fill", "#6c757d")
      .text(i);
  }

  const nowLineY1 = -5; // Start ABOVE the modality band for pill visibility

  // NOW indicator LINE - drawn here (in axisGroup, early) so it's BEHIND all content
  const nowLine = axisGroup
    .append("line")
    .attr("class", "now-line")
    .attr("y1", phaseHeight + 2)
    .attr("y2", axisY - 12)
    .attr("stroke", "#cc0000")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "4,2");

  // Draw phase bands
  const phasesGroup = g.append("g").attr("class", "phases-group");
  data.phases.forEach((phase) => {
    const x1 = xScale(phase.weeks[0]);
    const x2 = xScale(phase.weeks[1]);

    phasesGroup
      .append("rect")
      .attr("x", x1)
      .attr("y", 0)
      .attr("width", x2 - x1)
      .attr("height", phaseHeight)
      .attr("fill", phase.color)
      .attr("opacity", 0.3)
      .attr("rx", 4);

    phasesGroup
      .append("text")
      .attr("x", (x1 + x2) / 2)
      .attr("y", phaseHeight / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-size", "11px")
      .attr("font-weight", "600")
      .attr("fill", phase.color)
      .text(phase.name);
  });

  // Draw project bars (using project's color property, matching modalities)
  const projectsGroup = g.append("g").attr("class", "projects-group");

  data.projects.forEach((project) => {
    const x1 = xScale(project.startWeek);
    const x2 = xScale(project.endWeek);

    projectsGroup
      .append("rect")
      .attr("x", x1)
      .attr("y", projectY)
      .attr("width", x2 - x1)
      .attr("height", projectHeight)
      .attr("fill", project.color)
      .attr("opacity", 0.85)
      .attr("rx", 4);

    projectsGroup
      .append("text")
      .attr("x", (x1 + x2) / 2)
      .attr("y", projectY + projectHeight / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .attr("fill", "white")
      .text(`${project.id}: ${project.name}`);
  });

  // Draw homework markers (using a warm brown from extended palette - not red)
  // Handle multiple HWs on same week by offsetting them
  const hwColor = "#b15928"; // Brown from d3.schemePaired
  const hwGroup = g.append("g").attr("class", "hw-group");

  // Group homeworks by week to handle overlaps
  const hwByWeek = {};
  data.homeworks.forEach((hw) => {
    if (!hwByWeek[hw.dueWeek]) hwByWeek[hw.dueWeek] = [];
    hwByWeek[hw.dueWeek].push(hw);
  });

  Object.entries(hwByWeek).forEach(([week, hws]) => {
    const baseX = xScale(+week + 0.5);
    const count = hws.length;
    const spacing = 30; // pixels between overlapping HWs

    hws.forEach((hw, i) => {
      // Offset if multiple HWs on same week
      const offset = count > 1 ? (i - (count - 1) / 2) * spacing : 0;
      const x = baseX + offset;

      hwGroup
        .append("rect")
        .attr("x", x - 14)
        .attr("y", hwY - 8)
        .attr("width", 28)
        .attr("height", 16)
        .attr("fill", hwColor)
        .attr("rx", 8);

      hwGroup
        .append("text")
        .attr("x", x)
        .attr("y", hwY)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-size", "9px")
        .attr("font-weight", "bold")
        .attr("fill", "white")
        .text(hw.id);
    });
  });

  // NOW indicator PILL - drawn LAST so it's on top of everything
  // (The line was already drawn earlier in axisGroup to be behind content)
  const nowIndicator = g
    .append("g")
    .attr("class", "now-indicator")
    .style("cursor", "ew-resize");

  // Draggable pill background
  const pillHeight = 16;
  const pillY = nowLineY1 - 18;
  nowIndicator
    .append("rect")
    .attr("class", "now-pill")
    .attr("y", pillY)
    .attr("height", pillHeight)
    .attr("fill", "#cc0000")
    .attr("rx", 8);

  // NOW label text (inside pill, properly centered)
  nowIndicator
    .append("text")
    .attr("class", "now-label")
    .attr("y", pillY + pillHeight / 2)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "central")
    .attr("font-size", "9px")
    .attr("font-weight", "bold")
    .attr("fill", "white")
    .text("NOW");

  // Small arrow pointing down from pill
  nowIndicator
    .append("polygon")
    .attr("class", "now-arrow")
    .attr("fill", "#cc0000");

  // Invisible wider hit area for easier dragging
  nowIndicator
    .append("rect")
    .attr("class", "drag-handle")
    .attr("x", -15)
    .attr("y", pillY - 5)
    .attr("width", 30)
    .attr("height", axisY - pillY + 10)
    .attr("fill", "transparent");

  // Helper to update pill width based on text
  function updatePillWidth(text, x) {
    const pillWidth = text.length * 6 + 12; // Approximate width based on text length
    nowIndicator
      .select(".now-pill")
      .attr("x", x - pillWidth / 2)
      .attr("width", pillWidth);
  }

  // Drag behavior for the indicator
  const drag = d3
    .drag()
    .on("start", function () {
      nowIndicator.classed("dragging", true);
      nowLine.attr("stroke-width", 3);
      nowIndicator.select(".now-pill").attr("fill", "#aa0000"); // Darker when dragging
    })
    .on("drag", function (event) {
      // Clamp x to valid range
      const x = Math.max(0, Math.min(innerWidth, event.x));
      // Calculate nearest week
      const week = Math.max(1, Math.min(15, Math.round(xScale.invert(x))));
      const snappedX = xScale(week + 0.5);

      // Update visual position during drag - line is separate from pill
      nowLine.attr("x1", snappedX).attr("x2", snappedX);
      nowIndicator
        .select(".now-arrow")
        .attr(
          "points",
          `${snappedX - 4},${pillY + pillHeight + 2} ${snappedX + 4},${pillY + pillHeight + 2} ${snappedX},${pillY + pillHeight + 7}`,
        );
      nowIndicator.select(".drag-handle").attr("x", snappedX - 15);

      // Show target week during drag (show "NOW" if over current week)
      const currentWeek = dateToWeek(new Date());
      const labelText = week === currentWeek ? "NOW" : `Wk ${week}`;
      nowIndicator.select(".now-label").attr("x", snappedX).text(labelText);
      updatePillWidth(labelText, snappedX);
    })
    .on("end", function (event) {
      nowIndicator.classed("dragging", false);
      nowLine.attr("stroke-width", 2);
      nowIndicator.select(".now-pill").attr("fill", "#cc0000"); // Back to normal

      // Calculate final week and update widget
      const x = Math.max(0, Math.min(innerWidth, event.x));
      const week = Math.max(1, Math.min(15, Math.round(xScale.invert(x))));
      widget.setValue(week);
    });

  nowIndicator.call(drag);

  // Week selector popup (hidden by default)
  const weekPopup = document.createElement("div");
  weekPopup.className = "week-popup";
  weekPopup.style.cssText =
    "display:none; position:absolute; background:#fff; border:1px solid #ccc; border-radius:8px; padding:8px; box-shadow:0 4px 12px rgba(0,0,0,0.15); z-index:100; flex-wrap:wrap; gap:4px; max-width:200px;";

  for (let i = 1; i <= 15; i++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-sm btn-outline-secondary week-btn";
    btn.dataset.week = i;
    btn.textContent = i;
    btn.style.cssText = "width:32px; height:32px; padding:0; font-size:12px;";
    weekPopup.appendChild(btn);
  }
  container.style.position = "relative";
  container.appendChild(weekPopup);

  // Close popup when clicking outside
  document.addEventListener("click", (e) => {
    if (
      !weekPopup.contains(e.target) &&
      !e.target.classList.contains("week-title")
    ) {
      weekPopup.style.display = "none";
    }
  });

  // Week button click handler
  weekPopup.addEventListener("click", (e) => {
    if (e.target.classList.contains("week-btn")) {
      widget.setValue(+e.target.dataset.week);
      weekPopup.style.display = "none";
    }
  });

  // showValue updates the display based on current value
  function showValue() {
    const week = widget.value;
    const x = xScale(week + 0.5);
    const currentWeek = dateToWeek(new Date());

    // Dynamic label: "NOW" if viewing current week, "Wk #" otherwise
    const labelText = week === currentWeek ? "NOW" : `Wk ${week}`;

    // Update now indicator position - line is separate from pill
    nowLine.attr("x1", x).attr("x2", x);
    nowIndicator
      .select(".now-arrow")
      .attr(
        "points",
        `${x - 4},${pillY + pillHeight + 2} ${x + 4},${pillY + pillHeight + 2} ${x},${pillY + pillHeight + 7}`,
      );
    nowIndicator.select(".now-label").attr("x", x).text(labelText);
    nowIndicator.select(".drag-handle").attr("x", x - 15);
    updatePillWidth(labelText, x);

    // Update focus card
    const focus = data.weeklyFocus[week];
    const hw = data.homeworks.filter((h) => h.dueWeek === week);
    const projectDemo = data.projects.find((p) => p.endWeek === week);

    let hwText = "";
    if (hw.length > 0) {
      hwText = `<span class="badge me-2" style="background-color:${hwColor}">${hw.map((h) => h.id + " Due").join(", ")}</span>`;
    }

    let demoText = "";
    if (projectDemo) {
      demoText = `<span class="badge me-2" style="background-color:${projectDemo.color}">${projectDemo.id} Demo</span>`;
    }

    const isCurrentWeek = week === currentWeek;
    const weekLabel = isCurrentWeek ? `Week ${week} (Now)` : `Week ${week}`;

    focusCard.innerHTML = `
      <div class="d-flex justify-content-between align-items-start mb-2">
        <h5 class="mb-0">
          <span class="week-title" style="cursor:pointer; text-decoration:underline; text-decoration-style:dotted;" title="Click to select week">${weekLabel}</span>: ${focus.topic}
        </h5>
        <div>${hwText}${demoText}</div>
      </div>
      <div class="row">
        <div class="col-md-6">
          <strong>Project Focus:</strong> ${focus.project}
        </div>
        <div class="col-md-6">
          <strong>This Week:</strong> ${focus.action}
        </div>
      </div>
    `;

    // Highlight current week button in popup
    weekPopup.querySelectorAll(".week-btn").forEach((btn) => {
      const btnWeek = +btn.dataset.week;
      btn.classList.toggle("btn-danger", btnWeek === week);
      btn.classList.toggle("btn-outline-secondary", btnWeek !== week);
      btn.classList.toggle(
        "btn-outline-danger",
        btnWeek === currentWeek && btnWeek !== week,
      );
    });

    // Add click handler to week title
    const weekTitle = focusCard.querySelector(".week-title");
    if (weekTitle) {
      weekTitle.addEventListener("click", (e) => {
        e.stopPropagation();
        const rect = weekTitle.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        weekPopup.style.display =
          weekPopup.style.display === "none" ? "flex" : "none";
        weekPopup.style.left = rect.left - containerRect.left + "px";
        weekPopup.style.top = rect.bottom - containerRect.top + 5 + "px";
      });
    }
  }

  // Wrap with ReactiveWidget
  widget = ReactiveWidget(container, { value, showValue });

  // Show initial value
  showValue();

  return widget;
}

// Export for module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = { CourseTimeline, courseData, dateToWeek };
}
