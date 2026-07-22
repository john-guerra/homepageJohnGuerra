# CS 5610 Web Development — class page tests

Playwright end-to-end tests for the CS 5610 Web Development class site
(`classes/webDevelopment_online_summer_2026/`).

The `playwright.config.js` here serves the **whole class folder** with
`http-server` (no build step, no Python), so specs can address any page by its
real path — the class landing page at `/index.html`, the student projects page
at `/students/index.html`, and so on. Add new `*.spec.js` files in this
directory to grow coverage across the class site; they are all picked up
automatically.

## Setup (one time)

Dev dependencies are declared in the repo-root `package.json`
(`@playwright/test`, `http-server`). From the repo root:

```bash
npm install
npx playwright install chromium   # download the browser Playwright drives
```

## Run

From the repo root:

```bash
npm run test:cs5610
```

or directly:

```bash
npx playwright test --config=classes/webDevelopment_online_summer_2026/tests/playwright.config.js
```

Expected: **3 passed**.

## Current specs

### `clipping.spec.js` — student projects page, "clipped tall section" regression

Guards `students/index.html` against the bug where section grids used
`max-height: 2000px; overflow: hidden`, so any section taller than 2000px had
its bottom project cards clipped — invisible and unclickable (an
`overflow:hidden` box has no scrollbar, so the user can never reach them). The
fix wraps each `.projects-grid` in a `.projects-grid-wrapper` that animates
`grid-template-rows: 1fr ⇄ 0fr` instead of using `max-height`, so an expanded
section is never height-capped.

What it does:

- **Stubs the live Google Sheets CSV** via `page.route(...)` so the test is
  deterministic and does not depend on the network. It injects a synthetic
  dataset whose last section is ~4800px tall (well over the old 2000px cap).
- Asserts, for every expanded section, that the grid has **no unreachable
  overflow** (`scrollHeight ≤ clientHeight`), **no capping `max-height`**, the
  **last card sits inside the visible box**, and the **last card is hit-testable
  via `elementFromPoint`**.
- Asserts collapsing a section drives its wrapper `grid-template-rows` to `0px`
  and hides the content.
- Includes a `guard:` test that injects the old bug CSS and confirms the checks
  above actually detect it.

Prove it catches the regression (old bug injected at runtime — no app code is
changed); the main no-clip test must FAIL:

```bash
SIMULATE_BUG=1 npx playwright test \
  --config=classes/webDevelopment_online_summer_2026/tests/playwright.config.js \
  -g "expanded tall section"
```

Expected: **1 failed**, reporting `unreachable overflow`, a capping
`max-height`, and the last card past the visible box.
