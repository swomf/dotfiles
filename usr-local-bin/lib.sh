#!/usr/bin/env bash

export perm=sudo

confirm() {
  printf '\033[1;36m::\033[1;37m Want to run \033[0m'
  printf '%q ' "$@"
  printf '\nContinue?'
  read -r -p " [y/N] " reply
  case "$reply" in
  [Yy] | [Yy][Ee][Ss])
    "$@"
    echo "   $@"
    ;;
  *) printf "\033[1;31mSkipped.\033[0m\n" ;;
  esac
}
