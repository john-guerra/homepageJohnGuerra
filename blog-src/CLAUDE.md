# JAG² Blog — Authoring & Design Guide

This is John Alexis Guerra Gómez's personal blog, built with Astro. Posts live in `src/content/blog/*.mdx`.

## Non-negotiables

1. **Accessibility is a must.** Every post must be readable, navigable, and understandable for users with assistive technology. See the Accessibility section below.
2. **AI authorship disclosure.** If Claude drafted the post, it MUST use the `<AIByline />` component at the top.
3. **Single source of design truth.** All colors, typography, spacing, and layout primitives live in `src/styles/global.css`. Don't reinvent them per post or per component.

## Project structure

```
blog-src/
├── src/
│   ├── styles/
│   │   └── global.css            ← design tokens + reusable classes
│   ├── layouts/
│   │   └── BaseLayout.astro      ← slim wrapper, composes header + footer
│   ├── components/
│   │   ├── SiteHeader.astro      ← top nav (JAG² Blog · back link)
│   │   ├── SiteFooter.astro      ← author bio + social links
│   │   ├── AIByline.astro        ← "Written by Claude" disclosure
│   │   ├── SkillsChart.astro     ← full interactive viz (same as homepage)
│   │   └── SkillsChartOriginal.astro  ← static "before" variant
│   ├── content/
│   │   ├── config.ts             ← front matter schema (Zod)
│   │   └── blog/*.mdx            ← the actual posts
│   └── pages/
│       ├── index.astro           ← /blog/ listing
│       └── [...slug].astro       ← renders each post
└── public/                        ← static assets served under /blog/
```

## Design system — use the tokens, don't invent new ones

All tokens defined in `src/styles/global.css`:

### Colors (CSS custom properties)

| Token | Value | Use |
|---|---|---|
| `--link` | `#507b94` (steel blue) | Links, primary actions |
| `--link-hover` | `#385a70` | Link hover state |
| `--accent` | `#80b1d3` | Pills, badges, callout left borders |
| `--bg` | `#fefefa` | Page background |
| `--bg-soft` | `#f5f5f0` | Code blocks, muted callouts |
| `--text` | `#222` | Body text |
| `--text-muted` | `#666` | Captions, secondary text |
| `--text-faint` | `#888` | Metadata, dates |
| `--border` | `#eee` | Dividers, card outlines |

**The palette intentionally mirrors the homepage's experience-timeline steel blue.** Don't introduce new colors without updating `global.css` and considering the contrast ratios.

### Typography

| Token | Font | Use |
|---|---|---|
| `--font-sans` | Lato | Body copy |
| `--font-serif` | Playfair Display | Headings (h1-h4) |
| `--font-mono` | IBM Plex Mono | Code, `AIByline` (to visually flag AI content) |
| `--font-condensed` | Roboto Condensed | Labels, pills |

### Spacing

`--space-sm` (0.5rem), `--space-md` (1rem), `--space-lg` (1.5rem), `--space-xl` (2rem), `--space-2xl` (4rem).

### Reusable layout classes

| Class | What it does |
|---|---|
| `.container-blog` | Centered post container, max 720px |
| `.post-figure` | Wrapper for any chart/image with optional caption |
| `.two-col-grid` | 2-column grid that collapses to 1 column on mobile |
| `.post-float-right` | Sidebar-style callout (text flows around it) |
| `.before-label` / `.after-label` | Pill badges for comparison sections |
| `.tag` | Tag pill (used in post metadata) |
| `.ai-byline` | Applied automatically by `<AIByline />` |

**Rule:** If you're about to write a `<style>` block in an Astro component or MDX post, first check if there's a class in `global.css` that already does what you want.

## AI authorship — disclosure is non-negotiable

Every post declares its `author` in front matter:

```yaml
author: john            # default — John wrote it
author: claude          # Claude drafted on John's behalf
author: claude-edited   # Claude drafted, John revised substantially
```

When `author` is `claude` or `claude-edited`, the post must include the `AIByline` component right after the imports:

```mdx
import AIByline from "../../components/AIByline.astro";

<AIByline />                 {/* for "claude" */}
<AIByline edited />          {/* for "claude-edited" */}
```

The byline renders a distinctive callout (monospace font, accent-color left border, 🤖 icon) so readers never confuse Claude's voice for John's.

**When Claude writes a post, the text should refer to John in the third person** ("John rebuilt the skills section…") rather than in the first person ("I rebuilt the skills section…"). This reinforces that it isn't John speaking.

## Accessibility — a must, not a nice-to-have

1. **Every image must have meaningful `alt` text.** Not `alt="image"`. Describe what it conveys. For decorative images, use `alt=""`.
2. **SVG charts must have an `aria-label`** describing the data (see `SkillsChart.astro` for an example that lists every skill name).
3. **Interactive elements must be keyboard-reachable.** If you add a drag interaction, also provide a text/list fallback.
4. **Color is never the only signal.** If you use color to encode categories, include text labels too. Check contrast with a tool like [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) — body text must be ≥ 4.5:1, large text ≥ 3:1.
5. **Heading structure must be hierarchical.** `h1` = post title (set by template), then `h2`, `h3` within the post. Don't skip levels.
6. **Links must have descriptive text.** "Read more" is a fail. Use "[Reactive Widgets paper](…)" instead.
7. **Animations must respect `prefers-reduced-motion`.** If a component animates, check `@media (prefers-reduced-motion: reduce)` and disable/shorten it.
8. **Forms (if any) need labels.** `<label for="…">` paired with the input.
9. **Screen-reader text** when needed: use `.visually-hidden` pattern (or `sr-only`) — don't use `display: none` for content meant to be announced.

**Before shipping any post or component, do a quick audit:** tab through the page, check DevTools Accessibility tree, run Lighthouse accessibility audit. If a11y score is < 95, fix before publishing.

## Voice & style

- **First person when John writes, third person when Claude writes for John.**
- **Specific over generic.** "I re-exported PNGs from Keynote every time I added a skill" beats "managing diagrams was tedious."
- **Show the work.** Link to real code, papers, projects. This is a technical blog.
- **No hedging.** "I rebuilt it" not "I sort of rebuilt it kind of."

## Post structure

Front matter (validated by `config.ts`):

```yaml
---
title: "Sentence case title"
date: YYYY-MM-DD
tags:
  - tag-one
  - tag-two
description: "One-line summary for SEO and the post list. ~140 chars."
author: john            # or "claude" / "claude-edited"
---
```

Body: Markdown with optional JSX components (MDX).

Typical structure:
1. **Hook** — why this matters, what's the problem
2. **Middle** — the solution, what was tried, what broke
3. **Lesson** — the generalizable insight
4. **Closing** — link to code/paper/next post

Aim for 400–800 words. Go longer only for deep-dives.

## Images

- Post-specific: put under `public/img/posts/<post-slug>/` → reference as `/blog/img/posts/<post-slug>/foo.png`
- Shared with the main site: use absolute URLs (`https://johnguerra.co/...`)
- Always meaningful alt text — see Accessibility above

## Interactive components

- Reusable viz components go in `src/components/`.
- They should use the shared classes from `global.css` (`.post-figure`, `.two-col-grid`, etc.), not redefine layout styles.
- Fetch data from `/blog/…` paths (absolute) so they work regardless of where the component is used.
- Follow the `SkillsChart.astro` pattern for ports from the main site's D3 code.

## Building & testing

```bash
npm run dev        # dev server at :4321
npm run build      # static build to ../blog/
```

From the repo root, `./build.sh` runs both the main EJS site and the Astro blog.

## Don'ts

- ❌ Don't edit `../blog/` — it's the build output
- ❌ Don't commit `node_modules/` or `.astro-cache/`
- ❌ Don't add `skills.json` to `public/` manually — `build.sh` syncs it from the repo root
- ❌ Don't use generic stock-photo imagery or AI-generated hero images — use screenshots, diagrams, or photos of real things
- ❌ Don't define colors or spacing inline — use the CSS custom properties
- ❌ Don't ship without running an accessibility check
