// @ts-check
const { defineConfig, devices } = require("@playwright/test");
const path = require("path");

/**
 * Playwright config for the CS 5610 Web Development class pages.
 *
 * Serves the *entire* class folder (this config's parent dir) with
 * `http-server` (NOT python) so every page loads exactly as in production —
 * the class landing page at `/index.html`, the student projects page at
 * `/students/index.html`, etc. Specs address pages by their real paths.
 *
 * Add new *.spec.js files in this directory to cover more of the class site;
 * they are all picked up automatically (testDir below).
 */

// The class root: contains index.html, students/, project_form.html, …
const SITE_ROOT = path.resolve(__dirname, "..");
const PORT = 8321;

module.exports = defineConfig({
  testDir: __dirname,
  // Keep all run artifacts inside tests/ (gitignored) instead of the repo root.
  outputDir: path.join(__dirname, ".playwright-output"),
  fullyParallel: false,
  timeout: 30000,
  expect: { timeout: 10000 },
  reporter: [["list"]],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    // A stable, desktop-ish viewport so the grid renders at 4 columns and a
    // "tall" section is comfortably taller than the old 2000px clip cap.
    viewport: { width: 1280, height: 900 },
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: `npx http-server "${SITE_ROOT}" -p ${PORT} -c-1 --silent`,
    url: `http://127.0.0.1:${PORT}/index.html`,
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});
