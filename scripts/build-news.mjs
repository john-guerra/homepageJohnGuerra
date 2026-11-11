// Compile news/*.md (front matter + Markdown body) into news.json.
// Run from the repo root (build.sh does this). Fails loudly on invalid entries.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";

const NEWS_DIR = "news";
const OUT = "news.json";
const md = new MarkdownIt({ html: true, linkify: true });

const errors = [];
const items = [];

for (const file of readdirSync(NEWS_DIR).sort()) {
  if (!file.endsWith(".md") || file === "README.md") continue;
  const { data, content } = matter(readFileSync(join(NEWS_DIR, file), "utf8"));
  if (data.draft !== undefined && typeof data.draft !== "boolean")
    errors.push(`${file}: "draft" must be true or false (unquoted)`);
  if (data.draft === true) continue;

  // YAML parses `2026-11-10` into a Date at UTC midnight; keep it as YYYY-MM-DD.
  // Reject dates with a time part: converting those via UTC could shift the day.
  const isPlainDate =
    data.date instanceof Date && data.date.getTime() % 86400000 === 0;
  if (data.date instanceof Date && !isPlainDate)
    errors.push(`${file}: "date" must be a plain YYYY-MM-DD, without a time`);
  const date = isPlainDate ? data.date.toISOString().slice(0, 10) : String(data.date ?? "");

  if (!data.title) errors.push(`${file}: missing "title"`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.push(`${file}: "date" must be YYYY-MM-DD`);
  if (!content.trim()) errors.push(`${file}: empty body`);
  const links = data.links ?? [];
  if (!Array.isArray(links) || links.some((l) => !l?.label || !l?.href))
    errors.push(`${file}: each link needs "label" and "href"`);

  items.push({
    slug: file.replace(/\.md$/, ""),
    title: data.title,
    date,
    year: date.slice(0, 4),
    html: md.render(content).trim(),
    links,
  });
}

if (errors.length) {
  console.error("News build failed:\n  " + errors.join("\n  "));
  process.exit(1);
}

items.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
writeFileSync(OUT, JSON.stringify({ news: items }, null, 2) + "\n");
console.log(`Built ${items.length} news items → ${OUT}`);
