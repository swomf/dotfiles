#!/usr/bin/env bash

SCRIPT_DIR="$(readlink -f "$(dirname "$(readlink -f "$0")")")"
source "$SCRIPT_DIR/lib.sh"

for f in scripts/*; do
  if cmp -s "$f" /usr/local/bin/"$(basename "$f")"; then
    printf "%b::%b Skipped%b reinstall of %b %s\n" \
      "$b_CCIN" "$b_CWAR" "$b_CDEF" "$CDEF" "$f"
  else
    confirm "$perm" install -Dm755 "$f" /usr/local/bin/"$(basename "$f")"
  fi
done
