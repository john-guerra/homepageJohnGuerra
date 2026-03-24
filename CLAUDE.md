# John Guerra's Homepage

Personal academic homepage for John Alexis Guerra Gómez.

## Build System

This site uses EJS templates. **Never edit root `.html` files directly** — they are build outputs.

### How it works

```
src/*.ejs.html  →  build.sh (ejs + prettier)  →  *.html (root)
src/partials/   →  included via <%- include() %>
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

### Dependencies

- `ejs` — template compilation
- `prettier` — HTML formatting

Install: `npm install -g ejs prettier` or use `npx`

## Important Conventions

- The intro/nutshell section is **duplicated** in both `index.ejs.html` and `cv.ejs.html` (not a shared partial) — changes must be made in both files
- Title: **"Associate Teaching Professor"** (not "Assistant")
- Course pages using Pug (e.g., `classes/aiCoding_spring_2026/index.pug`) have their own build process

## Styling

- Bootstrap 5.3.2 via CDN
- Fonts: Playfair Display (headings), Lato (body) — Google Fonts
- Theme color: `#FF9800`, Background: `#fefefa`
