#!/bin/bash

# for each ejs file in the src folder compile it to html and save it in the root folder
for file in ./src/*.ejs.html; do
  npx ejs $file -o ./$(basename $file .ejs.html).html && npx prettier --write ./$(basename $file .ejs.html).html
done