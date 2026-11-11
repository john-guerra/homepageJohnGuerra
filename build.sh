#!/bin/bash
set -e

# Compile news/*.md → news.json
echo "Building news..."
node scripts/build-news.mjs

# ejs -f accepts a single data file, so merge skills.json + news.json
DATA_FILE=$(mktemp -t ejsdata.XXXXXX)
trap 'rm -f "$DATA_FILE"' EXIT
node -e '
  const fs = require("fs");
  const [skills, news, out] = process.argv.slice(1);
  const read = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
  fs.writeFileSync(out, JSON.stringify({ ...read(skills), ...read(news) }));
' skills.json news.json "$DATA_FILE"

# Build main EJS site
echo "Building main site (EJS)..."
for file in ./src/*.ejs.html; do
  npx ejs $file -f "$DATA_FILE" -o ./$(basename $file .ejs.html).html && \
    npx prettier --write ./$(basename $file .ejs.html).html
done

# Build blog (Astro) — outputs to ./blog/
if [ -d "blog-src" ]; then
  echo ""
  echo "Building blog (Astro)..."

  # Sync shared assets: skills.json is the source of truth at repo root
  cp skills.json blog-src/public/skills.json

  # Install deps if missing
  if [ ! -d "blog-src/node_modules" ]; then
    echo "Installing blog dependencies..."
    (cd blog-src && npm install)
  fi

  (cd blog-src && npm run build)

  # Clean up stray type files that Astro leaks into outDir
  rm -rf blog/astro blog/.astro

  echo "Blog built to ./blog/"
fi
