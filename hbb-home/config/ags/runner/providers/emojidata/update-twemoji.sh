#!/bin/sh
set -eu
cd "$(dirname "$0")"
version=17.0.3
release="twemoji-$version"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
curl -fsSL "https://github.com/jdecked/twemoji/archive/refs/tags/v$version.tar.gz" -o "$tmp/release.tar.gz"
tar -xzf "$tmp/release.tar.gz" -C "$tmp" "$release/assets/svg"
rsync -a --delete "$tmp/$release/assets/svg/" svg/
