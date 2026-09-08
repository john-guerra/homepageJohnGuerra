// @ts-check
const { test, expect } = require("@playwright/test");

/**
 * Regression test for the "clipped tall section" bug.
 *
 * THE BUG (must be caught if reintroduced):
 *   Section grids were styled `max-height: 2000px; overflow: hidden`, so any
 *   section taller than 2000px had its bottom project cards clipped — invisible
 *   and unreachable/unclickable (an `overflow:hidden` box cannot be scrolled by
 *   the user, so nothing past the 2000px cap can ever be seen or clicked).
 *
 * THE FIX (must pass):
 *   Each `.projects-grid` is wrapped in a `.projects-grid-wrapper` that animates
 *   `grid-template-rows: 1fr <-> 0fr` instead of using a fixed `max-height`, so
 *   an EXPANDED section is never height-capped and no card is ever clipped.
 *
 * Determinism: the test never touches the live Google Sheets fetch. It
 * intercepts the CSV request (page.route) and fulfills it with a synthetic
 * dataset whose last section is far taller than the old 2000px cap.
 */

// --- Deterministic fake data -------------------------------------------------

// One small section (sorts first) and one deliberately TALL section (sorts last,
// because of the "Zzz" key). The tall section's bottom cards live thousands of
// pixels down the page — exactly what the old cap used to clip.
const TALL_SECTION = "Zzz Tall Section";
const SMALL_SECTION = "Aaa Small Section";
const TALL_COUNT = 60; // 60 cards @ 4 columns => 15 rows, ~4800px — well over 2000
const SMALL_COUNT = 4;
const EXPECTED_CARDS = TALL_COUNT + SMALL_COUNT;

/**
 * Test-only CSS that makes each card an incompressible ~300px tall (production
 * cards have a fixed 140px thumbnail + body of the same order). Without this,
 * CSS Grid would compress the auto rows to fit a max-height instead of
 * overflowing — i.e. the synthetic cards would be too "squishy" to reproduce
 * the real clipping the bug caused. This does NOT touch the overflow/wrapper
 * mechanism under test; it only guarantees a realistically tall section.
 */
const INCOMPRESSIBLE_CARDS_CSS = `
  .topic .projects-grid .project-card { min-height: 300px !important; }
`;

// CSS that reproduces the OLD bug. Injected only when a test asks for it (guard
// test) or when SIMULATE_BUG=1 in the environment (used to prove the assertions
// actually fail on a regression). !important overrides the fix's rules.
const BUG_CSS = `
  .topic .projects-grid {
    max-height: 2000px !important;
    overflow: hidden !important;
  }
`;

/** Build a CSV string matching the field names projects.js reads. */
function buildCsv() {
  const headers = [
    "Timestamp",
    "Project",
    "Disabled",
    "University ID Number Student 1",
    "First name Student 1",
    "Full Name Student 1",
    "Personal homepage URL 1",
    "University ID Number Student 2",
    "Full Name Student 2",
    "Personal homepage URL 2",
    "Project Name",
    "Project Thumbnail URL",
    "Project URL",
    "Github repo URL",
    "Public video URL",
    "Google Slides URL",
  ];

  const rows = [];
  let uid = 1000;
  const addRow = (section, i) => {
    uid += 1; // unique per row so preProcess() does not dedup rows away
    rows.push([
      "2026-01-01 10:00:00",
      section,
      "", // Disabled empty => kept
      String(uid),
      `First${i}`,
      `Student ${section} ${i}`,
      "https://example.com/home",
      "", // no second student
      "",
      "",
      `Project ${section} ${i}`,
      "", // no thumbnail URL
      "https://example.com/demo",
      "https://example.com/repo",
      "",
      "",
    ]);
  };

  for (let i = 0; i < SMALL_COUNT; i++) addRow(SMALL_SECTION, i);
  for (let i = 0; i < TALL_COUNT; i++) addRow(TALL_SECTION, i);

  return [headers, ...rows].map((r) => r.join(",")).join("\n");
}

const FAKE_CSV = buildCsv();

/**
 * Navigate to the page with the CSV stubbed, wait for D3 to render, apply the
 * incompressible-card CSS, and optionally inject the old-bug CSS.
 */
async function loadPage(page, { injectBug = !!process.env.SIMULATE_BUG } = {}) {
  await page.route("**docs.google.com/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/csv; charset=utf-8",
      body: FAKE_CSV,
    })
  );

  await page.goto("/students/index.html", { waitUntil: "domcontentloaded" });

  await page.waitForFunction(
    (expected) =>
      document.querySelectorAll(".projects-grid .project-card").length === expected,
    EXPECTED_CARDS
  );

  await page.addStyleTag({ content: INCOMPRESSIBLE_CARDS_CSS });
  if (injectBug) await page.addStyleTag({ content: BUG_CSS });

  // Let layout settle.
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r())));
}

/**
 * Compute clipping violations across every EXPANDED (non-collapsed) section.
 * Returns an array of human-readable violation strings (empty === healthy).
 *
 * A section is "clipped" if any of these hold for its `.projects-grid`:
 *   1. It has scrollable overflow the user can't reach (scrollHeight > clientHeight).
 *      An overflow:hidden grid gives no scrollbar, so this content is unreachable.
 *   2. A fixed pixel `max-height` caps it below its content height.
 *   3. Its last card extends past the grid's visible box.
 */
async function findClippingViolations(page) {
  return page.evaluate(() => {
    const tol = 2; // sub-pixel tolerance
    const violations = [];
    document.querySelectorAll(".topic").forEach((topic) => {
      if (topic.classList.contains("collapsed")) return; // only expanded sections
      const section = topic.getAttribute("data-section");
      const grid = topic.querySelector(".projects-grid");
      if (!grid) return;

      // A user cannot scroll an overflow:hidden grid — normalize any residual
      // programmatic scroll so measurements reflect what the user can see.
      grid.scrollTop = 0;

      // 1) Unreachable overflow.
      if (grid.scrollHeight > grid.clientHeight + tol) {
        violations.push(
          `[${section}] grid has unreachable overflow: scrollHeight ${grid.scrollHeight} > clientHeight ${grid.clientHeight}`
        );
      }

      // 2) Fixed pixel max-height smaller than content.
      const mh = getComputedStyle(grid).maxHeight;
      if (mh && mh !== "none") {
        const px = parseFloat(mh);
        if (!Number.isNaN(px) && px < grid.scrollHeight - tol) {
          violations.push(
            `[${section}] fixed max-height ${mh} caps content of ${grid.scrollHeight}px`
          );
        }
      }

      // 3) Last card extends past the visible box.
      const cards = grid.querySelectorAll(".project-card");
      if (cards.length) {
        const last = cards[cards.length - 1];
        const gr = grid.getBoundingClientRect();
        const lr = last.getBoundingClientRect();
        const lastBottomInContent = lr.bottom - gr.top + grid.scrollTop;
        if (lastBottomInContent > grid.clientHeight + tol) {
          violations.push(
            `[${section}] last card bottom ${Math.round(lastBottomInContent)}px is past visible box (clientHeight ${grid.clientHeight})`
          );
        }
      }
    });
    return violations;
  });
}

/**
 * Hit-test the LAST card of the LAST (tall) section the way a real user would.
 *
 * Important: an `overflow:hidden` grid is still *programmatically* scrollable,
 * so a naive scrollIntoView would cheat by scrolling the hidden overflow to
 * reveal a card the user can never reach. We therefore force `grid.scrollTop=0`
 * (users can't scroll it) after bringing the card toward the viewport, then ask
 * the browser what element actually occupies the card's center.
 */
async function lastCardIsHitTestable(page) {
  await page.evaluate(() =>
    document.querySelectorAll(".projects-grid").forEach((g) => (g.scrollTop = 0))
  );
  await page
    .locator(".topic .projects-grid .project-card")
    .last()
    .scrollIntoViewIfNeeded()
    .catch(() => {});
  // Undo any internal scroll of an overflow:hidden grid (a user can't do that).
  await page.evaluate(() =>
    document.querySelectorAll(".projects-grid").forEach((g) => (g.scrollTop = 0))
  );

  return page.evaluate(() => {
    const topics = Array.from(document.querySelectorAll(".topic"));
    const lastTopic = topics[topics.length - 1];
    const cards = lastTopic.querySelectorAll(".project-card");
    const card = cards[cards.length - 1];
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const hit = document.elementFromPoint(cx, cy);
    return {
      ok: !!hit && (hit === card || card.contains(hit)),
      section: lastTopic.getAttribute("data-section"),
      cy: Math.round(cy),
      hitTag: hit ? hit.className || hit.tagName : null,
    };
  });
}

// --- Tests -------------------------------------------------------------------

test.describe("tall section is never clipped", () => {
  test("expanded tall section shows all cards with no clipping", async ({ page }) => {
    await loadPage(page);

    // Precondition: the tall section really IS taller than the old 2000px cap,
    // otherwise this test would prove nothing.
    const tallHeight = await page.evaluate((section) => {
      const grid = document.querySelector(`.topic[data-section="${section}"] .projects-grid`);
      return grid ? grid.scrollHeight : 0;
    }, TALL_SECTION);
    expect(tallHeight, "tall section must exceed the old 2000px cap").toBeGreaterThan(2500);

    // Invariants 1-3: no unreachable overflow, no capping max-height, last card
    // inside the visible box — for every expanded section.
    const violations = await findClippingViolations(page);
    expect(violations, `clipping violations:\n${violations.join("\n")}`).toEqual([]);

    // Invariant 4 (user-facing): the very last card of the tall section is
    // actually hit-testable via elementFromPoint.
    const hit = await lastCardIsHitTestable(page);
    expect(
      hit.ok,
      `last card of "${hit.section}" not hit-testable (elementFromPoint hit: ${hit.hitTag}, cy ${hit.cy})`
    ).toBe(true);
  });

  test("collapsing a section drives its wrapper rows toward 0 and hides content", async ({ page }) => {
    await loadPage(page);

    const topicSel = `.topic[data-section="${TALL_SECTION}"]`;
    const wrapperSel = `${topicSel} .projects-grid-wrapper`;
    const gridSel = `${topicSel} .projects-grid`;

    await page.click(`${topicSel} .topic-header`);

    // Class flips immediately.
    await expect(page.locator(topicSel)).toHaveClass(/collapsed/);

    // After the transition the wrapper's single grid row resolves to 0px, the
    // wrapper fades to opacity 0, and the overflow-hidden grid collapses to ~0.
    await expect
      .poll(() => page.evaluate((sel) => getComputedStyle(document.querySelector(sel)).gridTemplateRows, wrapperSel))
      .toBe("0px");

    await expect
      .poll(() => page.evaluate((sel) => getComputedStyle(document.querySelector(sel)).opacity, wrapperSel))
      .toBe("0");

    const gridClientHeight = await page.evaluate(
      (sel) => document.querySelector(sel).clientHeight,
      gridSel
    );
    expect(gridClientHeight, "collapsed grid should be visually height ~0").toBeLessThanOrEqual(5);

    // Sanity: expanding again restores full height with no clipping.
    await page.click(`${topicSel} .topic-header`);
    await expect(page.locator(topicSel)).not.toHaveClass(/collapsed/);
    await expect.poll(async () => (await findClippingViolations(page)).length).toBe(0);
  });

  // Meta / self-check: proves the assertions above are actually sensitive to the
  // bug. We inject the exact old CSS (`max-height:2000px; overflow:hidden`) and
  // assert the SAME checks now report violations and the last card becomes
  // un-hit-testable. This test PASSES only because it correctly DETECTS the
  // regression — a toothless check would make it fail.
  test("guard: re-introducing max-height:2000px;overflow:hidden is detected", async ({ page }) => {
    await loadPage(page, { injectBug: true });

    const violations = await findClippingViolations(page);
    expect(
      violations.length,
      "bug CSS injected but no clipping detected — the regression check is not sensitive!"
    ).toBeGreaterThan(0);
    expect(violations.join("\n")).toContain(TALL_SECTION);

    const hit = await lastCardIsHitTestable(page);
    expect(hit.ok, "with the bug injected the last card must NOT be hit-testable").toBe(false);
  });
});
