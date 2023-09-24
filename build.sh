#!/bin/bash

# for each ejs file in the src folder compile it to html and save it in the root folder
for file in ./src/*.ejs; do
  ejs $file -o ./$(basename $file .ejs).html && prettier --write ./$(basename $file .ejs).html
done