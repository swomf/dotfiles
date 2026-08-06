#!/usr/bin/env bash

export perm=sudo

export CDEF="\033[0m"      # default color
export CCIN="\033[0;36m"   # info color
export CGSC="\033[0;32m"   # success color
export CRER="\033[0;31m"   # error color
export CWAR="\033[0;33m"   # warning color
export b_CDEF="\033[1;37m" # bold default color
export b_CCIN="\033[1;36m" # bold info color
export b_CGSC="\033[1;32m" # bold success color
export b_CRER="\033[1;31m" # bold error color
export b_CWAR="\033[1;33m" # bold warning color

confirm() {
  printf "%b::%b Want to run %b " "$b_CCIN" "$b_CDEF" "$CDEF"
  printf '%q ' "$@"
  printf '\nContinue?'
  read -r -p " [y/N] " reply
  case "$reply" in
  [Yy] | [Yy][Ee][Ss])
    "$@"
    retcode=$?
    check=
    if ((retcode == 0)); then
      check="$b_CGSC✓$CDEF"
    else
      check="$b_CRER✗$CDEF"
    fi
    printf '[%b] ' "$check"
    printf "%q " "$@"
    printf '\n'
    ;;
  *) printf "%bSkipped.%b\n" "$b_CWAR" "$CDEF" ;;
  esac
}
