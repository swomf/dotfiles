hl.on("hyprland.start", function()
  -- Bar, wallpaper
  hl.exec_cmd("hyprpaper")
  -- oled
  hl.exec_cmd("hypridle")
  -- hl.exec_cmd("swww-daemon --format xrgb")
  -- hl.exec_cmd("/usr/lib/geoclue-2.0/demos/agent & gammastep")
  hl.exec_cmd("sleep 1 && gentoo-pipewire-launcher")
  hl.exec_cmd("sleep 2 && ags run")

  -- Input method
  -- hl.exec_cmd("fcitx5")

  -- Some funky desktop portal nonsense
  -- (ngl i kinda threw a whole lot of nonsense here, this was to get Saber working.)
  hl.exec_cmd("dbus-update-activation-environment --all WAYLAND_DISPLAY XDG_CURRENT_DESKTOP XDG_SESSION_TYPE")
  hl.exec_cmd(
    "sleep 1 && pkill -f xdg-desktop-portal-hyprland; pkill -f xdg-desktop-portal; sleep 1 && /usr/libexec/xdg-desktop-portal-hyprland"
  )
  hl.exec_cmd("sleep 3 && /usr/libexec/xdg-desktop-portal")

  -- Core components (authentication, lock screen, notification daemon)
  hl.exec_cmd("gnome-keyring-daemon --start --components=secrets")
  hl.exec_cmd(
    "/usr/lib/polkit-gnome/polkit-gnome-authentication-agent-1 || /usr/libexec/polkit-gnome-authentication-agent-1"
  )
  hl.exec_cmd("hypridle")
  hl.exec_cmd("dbus-update-activation-environment --all")
  hl.exec_cmd("hyprpm reload")

  -- Clipboard history
  hl.exec_cmd("wl-paste --watch cliphist store")

  -- Cursor
  --hl.exec_cmd("hyprctl setcursor Qogir 32")
  --hl.exec_cmd("sleep 5 && gsettings set org.gnome.desktop.interface cursor-theme Blackbriar && gsettings set org.gnome.desktop.interface cursor-size 32")
end)
