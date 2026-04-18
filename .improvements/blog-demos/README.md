# Blog Platform Demos — Eleventy vs Astro

Same post content, same styling (Bootstrap 5.3.2, Playfair/Lato), same output (static HTML). Two different SSGs.

## The sample post

Both demos contain the same post: **"Rethinking How I Present My Skills"**
- 4 paragraphs of prose
- Links (to homepage, IEEE paper)
- An embedded image (Reactive Widgets representative image)
- Front matter with title, date, tags, description

## Eleventy demo

```bash
cd eleventy
npm install
npm run serve     # dev server at http://localhost:8080
npm run build     # static output in _site/
```

**What to look at:**
- `posts/rethinking-skills.md` — the actual post (pure Markdown)
- `_includes/base.njk` + `_includes/post.njk` — layouts (Nunjucks — almost identical to EJS)
- `.eleventy.js` — config (~30 lines)
- `posts/posts.json` — data file setting layout + permalink pattern for all posts
- After build: `_site/blog/rethinking-skills/index.html` — the rendered post

## Astro demo

```bash
cd astro
npm install
npm run dev       # dev server at http://localhost:8081
npm run build     # static output in dist/
```

**What to look at:**
- `src/content/blog/rethinking-skills.mdx` — the post (MDX = Markdown + JSX)
- `src/content/config.ts` — schema validation for front matter (Zod)
- `src/layouts/BaseLayout.astro` — layout component
- `src/pages/blog/[...slug].astro` — dynamic route renders each post
- After build: `dist/blog/rethinking-skills/index.html` — the rendered post

## Things to compare

| Aspect | Eleventy | Astro |
|---|---|---|
| Post file | `posts/*.md` (pure Markdown) | `src/content/blog/*.mdx` (MDX with JSX option) |
| Templates | Nunjucks (EJS-like) | `.astro` components (JSX-like) |
| Front matter validation | None by default | Zod schema in `config.ts` |
| Dev server speed | Very fast | Fast, hot reload |
| Config files | `.eleventy.js` | `astro.config.mjs`, `tsconfig.json` (auto) |
| node_modules size | 35 MB (39 packages) | 147 MB (188 packages) |
| Build time (2 pages) | 50ms | 395ms |
| Rendered HTML lines | 52 | 5 (minified) |
| Build output | Clean static HTML | Clean static HTML + hashed assets |
| Can embed React/Svelte components? | Only via 11ty plugins | First-class |
| Learning curve from your EJS | Nearly zero | Moderate |

## Inline viz options

**Observable notebook iframe** — works identically in both, just paste the iframe HTML into the markdown. No platform difference.

**Vanilla D3 inline** — same, paste a `<script>` block with your D3 code.

**Component-based viz (React/Svelte/Vue)** — Astro wins. Eleventy can do it but requires plugins.

For your use case (markdown + occasional iframe/D3 script), both handle it equally well.

## Decision guide

- **Pick Eleventy if:** you want the closest-to-your-current-stack option, the smallest dependency tree, fastest to learn, fewest moving parts.
- **Pick Astro if:** you plan to build custom viz components you want to reuse across posts, or want stricter front matter validation out of the box.
