#!/usr/bin/env bash

SCRIPT_DIR="$(readlink -f "$(dirname "$(readlink -f "$0")")")"
source "$SCRIPT_DIR/lib.sh"

for f in $(find scripts -type f); do
  confirm "$perm" install -Dm755 "$f" /usr/local/bin/"$(basename $f)"
done
