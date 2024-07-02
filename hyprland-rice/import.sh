#!/usr/bin/env bash

set -euo pipefail

set -x

script_dir="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

arrow_msg() {
  printf "$(tput setaf 2)$(tput bold) => $(tput sgr0)$(tput bold)${1}$(tput sgr0)\n"
}

home_dots=(
  ".config/ags"
  ".config/hypr"
  ".config/xfce4/terminal/colorschemes"
  ".zshrc"
)

etc_configs=(
  "keyd"
)

for i in "${home_dots[@]}"; do
  # Remove leading dot and eliminate final / and letters afterwards
  #   e.g. .zshrc -> zshrc
  #   e.g. .config/hypr -> config
  #   e.g. .config/xfce4/terminal/colorschemes -> .config/xfce4/terminal
  form="$(echo "${i}" | sed 's/^\.//; s/\/[^\/]*$//')"
  arrow_msg "Sync ${HOME}/${i} -> ${script_dir}/${form}"
  rsync \
    --archive \
    --verbose \
    --human-readable \
    --progress \
    --delete \
    --exclude=".git*" \
    --mkpath \
    "${HOME}/${i}" "${script_dir}/${form}"
done

for i in "${etc_configs[@]}"; do
  arrow_msg "Sync /etc/${i} -> ${script_dir}/etc"
  rsync \
    --archive \
    --verbose \
    --human-readable \
    --progress \
    --delete \
    --exclude=".git*" \
    "/etc/${i}" "${script_dir}/etc/"
done
