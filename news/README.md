# News

One Markdown file per news item. `./build.sh` compiles them (via `scripts/build-news.mjs`)
into `news.json`, which feeds the homepage (latest 5) and `news.html` (all).

File name: `YYYY-MM-DD-short-slug.md`. Front matter:

```yaml
---
title: Short headline            # required
date: 2026-11-10                 # required, YYYY-MM-DD
links:                           # optional
  - label: Link text
    href: viz/some/path/          # relative to site root, or absolute URL
draft: true                      # optional, unquoted true/false; true = excluded
---

Body in Markdown (one short paragraph works best).
```
