### What do I do with this thing again?

1. Visit `about:profiles` on Firefox
2. Create a new profile (or use an old one)
3. Open its "root directory"
4. [Put files into root folder](https://github.com/arkenfox/user.js/wiki/3.4-Apply-&-Update-&-Maintain#-apply)
    - https://raw.githubusercontent.com/arkenfox/user.js/master/updater.sh
    - and user.js, user-overrides.js, prefsCleaner.sh
    - (bat if on Windows)
5. Run the updater (Windows? double-click `updater.bat`)
6. Reopen Firefox

*Make sure to update now and then...*

**Something you don't like?**  
Use a text editor like Notepad++ and edit `user-overrides.js`.

> "There's a weird box around my page when I fullscreen."  
  "Dark mode is broken!"  
  Check `appearance` on `user-overrides.js`

Be careful. This could hinder Zoom, reverse image search, or OpenGL games. Evaluate your threat model.