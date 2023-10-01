#!/bin/bash

# for each ejs file in the src folder compile it to html and save it in the root folder
for file in ./src/*.ejs.html; do
  ejs $file -o ./$(basename $file .ejs.html).html && prettier --write ./$(basename $file .ejs.html).html
done