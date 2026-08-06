# dotfiles

My dotfiles. These are maybe useful as reference. Batteries not included.

## dotfiles list

- [hbb][hbb]. **H**yprland (post-v0.55)+[**B**lack**b**riar theme][briar]+[Aylur's GTK Shell](https://github.com/Aylur/ags), on Gentoo.

  The Aylur's GTK Shell (gtk3; software rendering for RAM saving) stuff
  in here is mildly complicated, since it includes
  
  - a notification daemon
  - dmenu-like support
  - unit-aware calculator (rink)
  - unicode search
  - emoji search
  - word dictionary lookup
  - google translator lookup
  - and of course, a boring old app launcher.

  I package ags in the [funroll overlay][overlay]. This mainly includes my
  dotfiles and some `/usr/local/bin` scripts. However, `/etc/portage`
  stuff (and actual detail about how I set that up) is discussed at
  [funroll.swomf.com][funroll].

  Note that I keep some compiled stuff in my dotfiles that I don't git-commit!
  For example, the [ram display on my lockscreen][lockstatus.c], or the
  [emoji data][emoji] for emoji search (SVGs, tag lists).

  ![hbb preview](hbb-home/preview.webp)

## usr-local-bin

I have a lot of specific stuff in `/usr/local/bin`, a
mix of shell scripts and my own from-source stuff.
They're [documented-ish][usr-local-bin].

[ags]: https://github.com/Aylur/ags
[briar]: https://github.com/swomf/Blackbriar-theme
[emoji]: ./hbb-home/config/ags/runner/providers/emojidata
[funroll]: https://funroll.swomf.com
[lockstatus.c]: ./hbb-home/config/hypr/executable/lockstatus.c
[hbb]: ./hbb-home/README.md
[overlay]: https://github.com/swomf/overlay-funroll
[usr-local-bin]: ./usr-local-bin/README.md
