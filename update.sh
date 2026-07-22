#!/bin/sh

# Deploy the site to the EC2 server behind Apache at johnguerra.co.
# Build first with ./build.sh — this script only syncs the current working tree.
#
# --delete          : remove files on the server that no longer exist locally
# --delete-excluded : also remove excluded files already on the server
#                     (purges stray .md/.gitignore/.env/etc. from past deploys)
# Exclude patterns match at ANY depth, so nested files (e.g. blog-src/.gitignore,
# classes/*/.env) are caught too — rsync recurses into subdirectories.

rsync -avzgu --delete --delete-excluded --partial \
  --exclude=src \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=update.sh \
  --exclude='*.md' \
  --exclude=.gitignore \
  --exclude=.env \
  --exclude=.DS_Store \
  -e "ssh -i /Users/aguerra/Dropbox/dutoVizNew.pem" \
  * ubuntu@johnguerra.co:/var/www/johnguerra.co

# rsync -avzgu --delete --partial -e "ssh -i /Users/aguerra/Dropbox/tweetometro2.pem" * ubuntu@18.231.179.33:/var/www/johnguerra.co
# rsync -avzgu --delete --partial -e "ssh -i /Users/aguerra/Dropbox/tweetometro_paz.pem" * ubuntu@34.230.24.73:/var/www/johnguerra.co
