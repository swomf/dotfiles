#!/usr/bin/env sh

choice="$1"

# 1 if true
center=0
grow=0

usage() {
  printf "args: "
  printf "EXACTLY ONE OF: (center grow)\n"
}

if [ -z "$choice" ]; then
  usage
  return 1
else
  case "$choice" in
  center) center=1 ;;
  grow) grow=1 ;;
  *)
    printf "bad argument\n"
    usage
    return 1
    ;;
  esac
fi

a="$(hyprctl activewindow)"
is_floating="$(printf "%s\n" "$a" | awk '/floating: [01]/ {print $2}')"
at="$(printf "%s\n" "$a" | awk '/at: [0-9]+,[0-9]+/ {print $2}')"
size="$(printf "%s\n" "$a" | awk '/size: [0-9]+,[0-9]+/ {print $2}')"

size_width=$(echo "$size" | cut -d',' -f1)
size_height=$(echo "$size" | cut -d',' -f2)
at_x=$(echo "$at" | cut -d',' -f1)
at_y=$(echo "$at" | cut -d',' -f2)

new_size_width=$((size_width - 8))
new_size_height=$((size_height - 8))
new_at_x=$((at_x + 4))
new_at_y=$((at_y + 4))

if [ "$is_floating" = 1 ]; then
  # toggle float to no regardless of arg
  hyprctl dispatch togglefloating
  return 0
elif [ "$center" = 1 ]; then
  hyprctl --batch \
    "dispatch togglefloating;\
    dispatch resizeactive exact 80% 80%;\
    dispatch centerwindow;"
elif [ "$grow" = 1 ]; then
  hyprctl --batch \
    "dispatch togglefloating;\
    dispatch resizeactive exact ${new_size_width} ${new_size_height};\
    dispatch moveactive exact ${new_at_x} ${new_at_y};"
fi
