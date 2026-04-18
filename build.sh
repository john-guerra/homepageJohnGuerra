#!/bin/bash
set -e

# Build main EJS site
echo "Building main site (EJS)..."
for file in ./src/*.ejs.html; do
  npx ejs $file -f ./skills.json -o ./$(basename $file .ejs.html).html && \
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
