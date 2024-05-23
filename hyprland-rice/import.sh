#!/usr/bin/env bash

set -euo pipefail

script_dir="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

arrow_msg() {
  printf "$(tput setaf 2)$(tput bold) => $(tput sgr0)$(tput bold)${1}$(tput sgr0)\n"
}

home_dots=(
  ".config/ags"
  ".config/hypr"
  ".config/foot"
)

etc_configs=(
  "keyd"
)

for i in "${home_dots[@]}"; do
  dotless_form="$(echo ${i} | sed 's/^.//g')"
  arrow_msg "Sync ${HOME}/${i} -> $(dirname ${script_dir}/${dotless_form})"
  rsync \
    --archive \
    --verbose \
    --human-readable \
    --progress \
    --delete \
    --exclude=".git*" \
    "${HOME}/${i}" "$(dirname ${script_dir}/${dotless_form})"
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