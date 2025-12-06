#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"

sync_msg() {
  printf "$(tput setaf 2)$(tput bold) => $(tput sgr0)$(tput bold)Sync ${1}$(tput setaf 2)$(tput bold) -> $(tput sgr0)$(tput bold)${2}$(tput sgr0)\n"
}

home_dots=(
  ".config/ags"
  ".config/hypr"
  ".config/foot"
  ".config/anyrun"
  ".config/swappy"
  ".config/nnn"
  ".config/nvim/lua"
  ".config/nvim/snippets"
  ".zshrc"
)

etc_configs=(
)

for i in "${home_dots[@]}"; do
  # Remove leading dot and eliminate final / and letters afterwards
  #   e.g. .zshrc -> zshrc
  #   e.g. .config/hypr -> config
  #   e.g. .config/nvim/lua -> config/nvim
  form="${i#.}" && form="${form%/*}"
  sync_msg "${HOME}/${i}" "${script_dir}/${form}"
  rsync \
    --archive \
    --verbose \
    --human-readable \
    --progress \
    --delete \
    --exclude=".git" \
    "${HOME}/${i}" "${script_dir}/${form}"
done

for i in "${etc_configs[@]}"; do
  sync_msg "/etc/${i}" "${script_dir}/etc"
  rsync \
    --archive \
    --verbose \
    --human-readable \
    --progress \
    --delete \
    --exclude=".git" \
    "/etc/${i}" "${script_dir}/etc/"
done
