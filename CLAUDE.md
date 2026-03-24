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
