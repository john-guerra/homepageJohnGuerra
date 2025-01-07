#!/bin/sh

# scp -i ~/documentos/dutoViz/dutoviz.pem * ubuntu@ec2-23-22-159-101.compute-1.amazonaws.com:/var/www/albumsExplorer
rsync -avur --exclude node_modules --exclude proxy --exclude ./backend --exclude ./backend_github --delete --progress --copy-links -e "ssh -i /Users/aguerra/Dropbox/dutoVizNew.pem" --delete * ubuntu@johnguerra.co:/var/www/reactiveWidgets

