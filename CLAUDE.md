# John Guerra's Homepage

Personal academic homepage for John Alexis Guerra Gómez.

## Build System

Hybrid: EJS for the main site + Astro for the blog. **Never edit root `.html` files directly** — they are build outputs. Same for `blog/` — it's the Astro build output, edit `blog-src/` instead.

### How it works

```
src/*.ejs.html    →  build.sh (ejs + prettier)       →  *.html (root)
src/partials/     →  included via <%- include() %>
blog-src/         →  build.sh (Astro build)          →  blog/ (static output)
```

### Workflow

1. Edit files in `src/` (templates and partials)
2. Run `./build.sh` to regenerate root HTML files
3. Commit both the `src/` changes and the generated `.html` files

### Key partials (src/partials/)

| Partial | Used by | Content |
|---------|---------|---------|
| `headersPartial` | index, cv, experience | CSS, fonts, meta tags, PWA config |
| `experiencePartial` | index, cv, experience | Career history (~530 lines) |
| `papersPartial` | index, cv, papers | Papers section with filters |
| `projectsPartial` | index, cv | Project listings |
| `notebooksPartial` | index, cv | Observable notebook embeds |
| `videosPartial` | index | YouTube video embeds |
| `nutshellPartial` | index, cv | "In a nutshell" bio + "By the numbers" with dynamic year counts |

### Dependencies

- `ejs` — template compilation
- `prettier` — HTML formatting

Install: `npm install -g ejs prettier` or use `npx`

## Important Conventions

- The intro/nutshell section is shared via `nutshellPartial.ejs.html` — edit the partial, not individual pages. The skills column differs per page (D3 charts on index, text list on CV).
- Title: **"Associate Teaching Professor"** (not "Assistant")
- Course pages using Pug (e.g., `classes/aiCoding_spring_2026/index.pug`) have their own build process

## Blog (Astro)

The blog lives at `/blog/` on the deployed site.

- **Source:** `blog-src/` — standard Astro project
- **Output:** `blog/` — committed to git (Apache serves it)
- **Posts:** `blog-src/src/content/blog/*.mdx` (Markdown + JSX components)
- **Layouts:** `blog-src/src/layouts/BaseLayout.astro`
- **Reusable viz components:** `blog-src/src/components/` (e.g., `SkillsChart.astro`)
- **Front matter schema:** validated via Zod in `blog-src/src/content/config.ts`

`build.sh` automatically copies `skills.json` from repo root into `blog-src/public/` so blog posts can fetch it at `/blog/skills.json`.

## Styling

- Bootstrap 5.3.2 via CDN
- Fonts: Playfair Display (headings), Lato (body) — Google Fonts
- Theme color: `#FF9800`, Background: `#fefefa`
