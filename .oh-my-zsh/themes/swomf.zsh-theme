# Based on rkj-repos and heapbytes
# Compatible with Termux

# tun0, which would refer to the IP of the vpn tunnel, is excluded
# `ifconfig wlan0` is replaced with `grep` due to Termux permission limitations
get_ip_address() {
  if [[ -n "$(ifconfig 2>/dev/null | grep wlan0 -A1 | grep inet)" ]]; then
    echo " $(ifconfig 2>/dev/null | grep wlan0 -A1 | awk '/inet / {print $2}')"
  else
    echo ""
  fi
}
# ⨯
termux_get_ip_address() {
  if [[ -n "$(ifconfig 2>/dev/null | grep wlan0 -A1 | grep inet)" ]]; then
    echo "$(ifconfig 2>/dev/null | grep wlan0 -A1 | awk '/inet / {print $2}')"
  else
    echo ""
  fi
}

ZSH_THEME_GIT_PROMPT_ADDED="%{$fg[cyan]%}+"
ZSH_THEME_GIT_PROMPT_MODIFIED="%{$fg[yellow]%}✱"
ZSH_THEME_GIT_PROMPT_DELETED="%{$fg[red]%}✗"
ZSH_THEME_GIT_PROMPT_RENAMED="%{$fg[blue]%}➦"
ZSH_THEME_GIT_PROMPT_UNMERGED="%{$fg[magenta]%}✂"
ZSH_THEME_GIT_PROMPT_UNTRACKED="%{$fg[blue]%}✈"

function mygit() {
  if [[ "$(git config --get oh-my-zsh.hide-status)" != "1" ]]; then
    ref=$(command git symbolic-ref HEAD 2> /dev/null) || \
    ref=$(command git rev-parse --short HEAD 2> /dev/null) || return
    echo "${ref#refs/heads/} $(git_prompt_status)%{$fg_bold[green]%} "
  fi
}

function retcode() {}

# Main
PROMPT=$'%{$fg_bold[blue]%}╭─[%{$fg_bold[green]%}%n%b%{$fg[black]%}@%{$fg[cyan]%}%m%{$fg_bold[cyan]%}$(get_ip_address)%{$reset_color%}%{$fg_bold[blue]%}]%{$reset_color%} %{$fg[blue]%}%~ %{$fg_bold[green]%}$(mygit)$(hg_prompt_info)%{$reset_color%}
%{$fg_bold[blue]%}╰─>%{$reset_color%} '
PS2=$' \e[0;34m%}%B>%{\e[0m%}%b '


# Alternate for Termux
# PROMPT=$'%{$fg_bold[blue]%}╭─[%{$fg[cyan]%}$(termux_get_ip_address)%{$fg_bold[blue]%}]%{$reset_color%} %{$fg[cyan]%}%~ %{$fg_bold[green]%}$(mygit)$(hg_prompt_info)%{$reset_color%}
# %{$fg_bold[blue]%}╰─>%{$reset_color%} '
# PS2=$' \e[0;34m%}%B>%{\e[0m%}%b '
