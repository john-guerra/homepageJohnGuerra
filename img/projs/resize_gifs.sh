# bash

for filename in ./*.gif; do
  if [[ $filename != *"_small"* ]] && [ ! -f "${filename%.gif}_small.gif" ]; then
    echo $filename
    convert $filename -coalesce -scale 120 -layers Optimize  "${filename%.gif}_small.gif"
  fi
done

for filename in ./*.png; do
  if [[ $filename != *"_small"* ]] && [ ! -f "${filename%.png}_small.png" ]; then
    echo $filename
    convert $filename -scale 120   "${filename%.png}_small.png"
  fi
done

for filename in ./*.jpg; do
  if [[ $filename != *"_small"* ]] && [ ! -f  "${filename%.jpg}_small.jpg" ]; then
    echo $filename
    convert $filename -scale 120   "${filename%.jpg}_small.jpg"
  fi
done