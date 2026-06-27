-- stylua: ignore start

-- ######################### Media / hardware keybinds #########################

-- Volume
hl.bind("XF86AudioMute",        hl.dsp.exec_cmd("wpctl set-mute @DEFAULT_SINK@ toggle"),             { locked = true })
hl.bind("XF86AudioLowerVolume", hl.dsp.exec_cmd("wpctl set-volume @DEFAULT_AUDIO_SINK@ 5%-"),        { locked = true, repeating = true })
hl.bind("XF86AudioRaiseVolume", hl.dsp.exec_cmd("wpctl set-volume -l 1.5 @DEFAULT_AUDIO_SINK@ 5%+"), { locked = true, repeating = true })

-- Brightness
hl.bind("XF86MonBrightnessUp",   hl.dsp.exec_cmd("brightnessctl set '8+'"), { locked = true, repeating = true })
hl.bind("XF86MonBrightnessDown", hl.dsp.exec_cmd("brightnessctl set '8-'"), { locked = true, repeating = true })

-- ################################### Applications ####################################

-- Note: for VSCode you need to place "password-store: gnome" in ~/.vscode/argv.json
-- hl.bind("SUPER + C", hl.dsp.exec_cmd("code --password-store=gnome-libsecret --enable-features=UseOzonePlatform --ozone-platform=wayland"))
hl.bind("SUPER + T",             hl.dsp.exec_cmd('foot --working-directory "$(~/.config/hypr/executable/hyprcwd)"'))
hl.bind("CTRL + ALT + T",        hl.dsp.exec_cmd('kitty --directory "$(~/.config/hypr/executable/hyprcwd)"'))
-- hl.bind("SUPER + E",          hl.dsp.exec_cmd("nautilus --new-window"))
hl.bind("SUPER + E",             hl.dsp.exec_cmd('nemo "$(~/.config/hypr/executable/hyprcwd)"'))
hl.bind("SUPER + F",             hl.dsp.exec_cmd("firefox || firefox-bin"))
hl.bind("CTRL + SHIFT + SUPER + P", hl.dsp.exec_cmd("firefox --private-window || firefox-bin --private-window"))
hl.bind("SUPER + M",             hl.dsp.exec_cmd("anyrun --plugins /etc/anyrun/plugins/librink.so"))    -- measurement
hl.bind("SUPER + U",             hl.dsp.exec_cmd("anyrun --plugins /etc/anyrun/plugins/libsymbols.so")) -- unicode
hl.bind("SUPER + O",             hl.dsp.exec_cmd("~/.config/hypr/executable/gotoapp -a obsidian"))
hl.bind("SUPER + ALT + O",       hl.dsp.exec_cmd("~/.config/hypr/executable/gotoapp --app obsidian --send-to-workspace"))

-- hl.bind("CTRL + SUPER + V",  hl.dsp.exec_cmd("pavucontrol"))
hl.bind("CTRL + SUPER + SHIFT + V", hl.dsp.exec_cmd("~/.config/hypr/executable/gotoapp -c com.github.wwmm.easyeffects -a easyeffects"))
hl.bind("CTRL + SHIFT + Escape",    hl.dsp.exec_cmd("foot -- btop"))

-- Actions
hl.bind("SUPER + period", hl.dsp.exec_cmd("pkill fuzzel || ~/.config/hypr/executable/fuzzel-emoji"))
hl.bind("SUPER + comma",  hl.dsp.exec_cmd("pkill fuzzel || ~/git/fuzzel-math/fuzzel-math"))
hl.bind("SUPER + Q",      hl.dsp.window.close())
hl.bind("ALT + F4",       hl.dsp.window.close())
hl.bind("SHIFT + ALT + F",         hl.dsp.exec_cmd("~/.config/hypr/executable/togglefloat center"))
hl.bind("SHIFT + SUPER + F",       hl.dsp.exec_cmd("~/.config/hypr/executable/togglefloat grow"))
hl.bind("CTRL + SHIFT + ALT + F",  function()
    hl.dispatch(hl.dsp.window.float())
    hl.dispatch(hl.dsp.window.resize({ x = 640, y = 480 }))
end)
hl.bind("SHIFT + SUPER + ALT + F", hl.dsp.exec_cmd("~/.config/hypr/executable/togglefloat center"))
hl.bind("SHIFT + SUPER + ALT + Q", hl.dsp.exec_cmd("hyprctl kill"))

-- Screenshot, Record, OCR, Color picker, Clipboard history
-- slurp picks the region, grim screenshots a geometry, swappy edits a picture
hl.bind("Print",         hl.dsp.exec_cmd('grim -g "$(slurp)" - | swappy -f -'))
hl.bind("CTRL + Print",  hl.dsp.exec_cmd('grim - | wl-copy && notify-send "Screenshot copied to clipboard" "grim - | wl-copy" --app-name="screenshot" -t 2000'))
hl.bind("SUPER + V",     hl.dsp.exec_cmd("cliphist list | anyrun --show-results-immediately true --plugins libstdin.so | cliphist decode | wl-copy"))
hl.bind("SHIFT + Print", hl.dsp.exec_cmd("~/.config/hypr/executable/post-hoc-screenshot"))

-- Image-to-text
hl.bind("SUPER + SHIFT + T", hl.dsp.exec_cmd('grim -g "$(slurp)" - | tesseract stdin stdout -l eng+jpn | wl-copy'))

-- Lock screen
hl.bind("SUPER + L",        hl.dsp.exec_cmd("~/.config/hypr/executable/hyprlock"))
hl.bind("CTRL + SUPER + L", hl.dsp.exec_cmd("hyprlock -c ~/.config/hypr/hyprlock-encrypted.conf"))

-- App launcher
hl.bind("SUPER + R", hl.dsp.exec_cmd("anyrun"))

-- ########################### Hyprland window/workspace binds ############################

-- Swap windows
hl.bind("SUPER + SHIFT + left",  hl.dsp.window.swap({ direction = "l" }))
hl.bind("SUPER + SHIFT + A",     hl.dsp.window.swap({ direction = "l" }))
hl.bind("SUPER + SHIFT + right", hl.dsp.window.swap({ direction = "r" }))
hl.bind("SUPER + SHIFT + D",     hl.dsp.window.swap({ direction = "r" }))
hl.bind("SUPER + SHIFT + up",    hl.dsp.window.swap({ direction = "u" }))
hl.bind("SUPER + SHIFT + W",     hl.dsp.window.swap({ direction = "u" }))
hl.bind("SUPER + SHIFT + down",  hl.dsp.window.swap({ direction = "d" }))
hl.bind("SUPER + SHIFT + S",     hl.dsp.window.swap({ direction = "d" }))
hl.bind("SUPER + P",             hl.dsp.window.pin())

-- Move focus (arrow keys and WASD)
hl.bind("SUPER + left",        hl.dsp.focus({ direction = "l" }))
hl.bind("SUPER + A",           hl.dsp.focus({ direction = "l" }))
hl.bind("SUPER + right",       hl.dsp.focus({ direction = "r" }))
hl.bind("SUPER + D",           hl.dsp.focus({ direction = "r" }))
hl.bind("SUPER + up",          hl.dsp.focus({ direction = "u" }))
hl.bind("SUPER + W",           hl.dsp.focus({ direction = "u" }))
hl.bind("SUPER + down",        hl.dsp.focus({ direction = "d" }))
hl.bind("SUPER + S",           hl.dsp.focus({ direction = "d" }))
hl.bind("SUPER + bracketleft", hl.dsp.focus({ direction = "l" }))
hl.bind("SUPER + bracketright",hl.dsp.focus({ direction = "r" }))

-- Workspace switch with keyboard
hl.bind("CTRL + SUPER + right",        hl.dsp.focus({ workspace = "+1" }))
hl.bind("CTRL + SUPER + D",            hl.dsp.focus({ workspace = "+1" }))
hl.bind("CTRL + SUPER + left",         hl.dsp.focus({ workspace = "-1" }))
hl.bind("CTRL + SUPER + A",            hl.dsp.focus({ workspace = "-1" }))
hl.bind("SUPER + mouse:275",           hl.dsp.focus({ workspace = "-1" }))
hl.bind("SUPER + mouse:276",           hl.dsp.focus({ workspace = "+1" }))
hl.bind("CTRL + SUPER + bracketleft",  hl.dsp.focus({ workspace = "-1" }))
hl.bind("CTRL + SUPER + bracketright", hl.dsp.focus({ workspace = "+1" }))
hl.bind("CTRL + SUPER + up",   hl.dsp.exec_cmd([[test "$(hyprctl activeworkspace -j|jq '.id')" -le 20 || hyprctl dispatch workspace -20]]))
hl.bind("CTRL + SUPER + W",    hl.dsp.exec_cmd([[test "$(hyprctl activeworkspace -j|jq '.id')" -le 20 || hyprctl dispatch workspace -20]]))
hl.bind("CTRL + SUPER + down", hl.dsp.focus({ workspace = "+20" }))
hl.bind("CTRL + SUPER + S",    hl.dsp.focus({ workspace = "+20" }))

-- Move window to workspace (follow)
hl.bind("CTRL + SHIFT + SUPER + up",   hl.dsp.exec_cmd([[test "$(hyprctl activeworkspace -j|jq '.id')" -le 20 || hyprctl dispatch movetoworkspace -20]]))
hl.bind("CTRL + SHIFT + SUPER + W",    hl.dsp.exec_cmd([[test "$(hyprctl activeworkspace -j|jq '.id')" -le 20 || hyprctl dispatch movetoworkspace -20]]))
hl.bind("CTRL + SHIFT + SUPER + down", hl.dsp.window.move({ workspace = "+20", follow = true }))
hl.bind("CTRL + SHIFT + SUPER + S",    hl.dsp.window.move({ workspace = "+20", follow = true }))

hl.bind("SUPER + Page_Down",           hl.dsp.focus({ workspace = "+1" }))
hl.bind("SUPER + Page_Up",             hl.dsp.focus({ workspace = "-1" }))
hl.bind("CTRL + SUPER + Page_Down",    hl.dsp.focus({ workspace = "+1" }))
hl.bind("CTRL + SUPER + Page_Up",      hl.dsp.focus({ workspace = "-1" }))
hl.bind("SUPER + ALT + Page_Down",     hl.dsp.window.move({ workspace = "+1", follow = true }))
hl.bind("SUPER + ALT + Page_Up",       hl.dsp.window.move({ workspace = "-1", follow = true }))
hl.bind("SUPER + SHIFT + Page_Down",   hl.dsp.window.move({ workspace = "+1", follow = true }))
hl.bind("SUPER + SHIFT + Page_Up",     hl.dsp.window.move({ workspace = "-1", follow = true }))
hl.bind("CTRL + SUPER + SHIFT + Right",hl.dsp.window.move({ workspace = "+1", follow = true }))
hl.bind("CTRL + SUPER + SHIFT + D",    hl.dsp.window.move({ workspace = "+1", follow = true }))
hl.bind("CTRL + SUPER + SHIFT + Left", hl.dsp.window.move({ workspace = "-1", follow = true }))
hl.bind("CTRL + SUPER + SHIFT + A",    hl.dsp.window.move({ workspace = "-1", follow = true }))
hl.bind("SUPER + SHIFT + mouse_down",  hl.dsp.window.move({ workspace = "-1", follow = true }))
hl.bind("SUPER + SHIFT + mouse_up",    hl.dsp.window.move({ workspace = "+1", follow = true }))
hl.bind("SUPER + ALT + mouse_down",    hl.dsp.window.move({ workspace = "-1", follow = true }))
hl.bind("SUPER + ALT + mouse_up",      hl.dsp.window.move({ workspace = "+1", follow = true }))

-- Window split ratio
hl.bind("SUPER + minus",      hl.dsp.layout("splitratio -0.1"), { repeating = true })
hl.bind("SUPER + equal",      hl.dsp.layout("splitratio 0.1"),  { repeating = true })
hl.bind("SUPER + semicolon",  hl.dsp.layout("splitratio -0.1"), { repeating = true })
hl.bind("SUPER + apostrophe", hl.dsp.layout("splitratio 0.1"),  { repeating = true })

-- Fullscreen
hl.bind("F11",        hl.dsp.window.fullscreen({ mode = "fullscreen" }))
hl.bind("SHIFT + F11",hl.dsp.window.fullscreen_state({ internal = 1,  client = -1 }))
hl.bind("SUPER + F11",hl.dsp.window.fullscreen_state({ internal = -1, client = 3  }))

-- Workspace switching (number keys)
hl.bind("SUPER + 1",         hl.dsp.focus({ workspace = "1"  }))
hl.bind("SUPER + 2",         hl.dsp.focus({ workspace = "2"  }))
hl.bind("SUPER + 3",         hl.dsp.focus({ workspace = "3"  }))
hl.bind("SUPER + 4",         hl.dsp.focus({ workspace = "4"  }))
hl.bind("SUPER + 5",         hl.dsp.focus({ workspace = "5"  }))
hl.bind("SUPER + 6",         hl.dsp.focus({ workspace = "6"  }))
hl.bind("SUPER + 7",         hl.dsp.focus({ workspace = "7"  }))
hl.bind("SUPER + 8",         hl.dsp.focus({ workspace = "8"  }))
hl.bind("SUPER + 9",         hl.dsp.focus({ workspace = "9"  }))
hl.bind("SUPER + 0",         hl.dsp.focus({ workspace = "10" }))
hl.bind("SUPER + SHIFT + 1", hl.dsp.focus({ workspace = "11" }))
hl.bind("SUPER + SHIFT + 2", hl.dsp.focus({ workspace = "12" }))
hl.bind("SUPER + SHIFT + 3", hl.dsp.focus({ workspace = "13" }))
hl.bind("SUPER + SHIFT + 4", hl.dsp.focus({ workspace = "14" }))
hl.bind("SUPER + SHIFT + 5", hl.dsp.focus({ workspace = "15" }))
hl.bind("SUPER + SHIFT + 6", hl.dsp.focus({ workspace = "16" }))
hl.bind("SUPER + SHIFT + 7", hl.dsp.focus({ workspace = "17" }))
hl.bind("SUPER + SHIFT + 8", hl.dsp.focus({ workspace = "18" }))
hl.bind("SUPER + SHIFT + 9", hl.dsp.focus({ workspace = "19" }))
hl.bind("SUPER + SHIFT + 0", hl.dsp.focus({ workspace = "20" }))

-- Alt+Tab window cycling
hl.bind("ALT + Tab", function()
    hl.dispatch(hl.dsp.window.cycle_next())
    hl.dispatch(hl.dsp.window.alter_zorder({ mode = "top" }))
end)
hl.bind("SHIFT + ALT + Tab", function()
    hl.dispatch(hl.dsp.window.cycle_next({ next = false }))
    hl.dispatch(hl.dsp.window.alter_zorder({ mode = "top" }))
end)

-- Move window to workspace silently (no follow)
hl.bind("SUPER + ALT + 1",         hl.dsp.window.move({ workspace = "1",  follow = false }))
hl.bind("SUPER + ALT + 2",         hl.dsp.window.move({ workspace = "2",  follow = false }))
hl.bind("SUPER + ALT + 3",         hl.dsp.window.move({ workspace = "3",  follow = false }))
hl.bind("SUPER + ALT + 4",         hl.dsp.window.move({ workspace = "4",  follow = false }))
hl.bind("SUPER + ALT + 5",         hl.dsp.window.move({ workspace = "5",  follow = false }))
hl.bind("SUPER + ALT + 6",         hl.dsp.window.move({ workspace = "6",  follow = false }))
hl.bind("SUPER + ALT + 7",         hl.dsp.window.move({ workspace = "7",  follow = false }))
hl.bind("SUPER + ALT + 8",         hl.dsp.window.move({ workspace = "8",  follow = false }))
hl.bind("SUPER + ALT + 9",         hl.dsp.window.move({ workspace = "9",  follow = false }))
hl.bind("SUPER + ALT + 0",         hl.dsp.window.move({ workspace = "10", follow = false }))
hl.bind("SUPER + SHIFT + ALT + 1", hl.dsp.window.move({ workspace = "11", follow = false }))
hl.bind("SUPER + SHIFT + ALT + 2", hl.dsp.window.move({ workspace = "12", follow = false }))
hl.bind("SUPER + SHIFT + ALT + 3", hl.dsp.window.move({ workspace = "13", follow = false }))
hl.bind("SUPER + SHIFT + ALT + 4", hl.dsp.window.move({ workspace = "14", follow = false }))
hl.bind("SUPER + SHIFT + ALT + 5", hl.dsp.window.move({ workspace = "15", follow = false }))
hl.bind("SUPER + SHIFT + ALT + 6", hl.dsp.window.move({ workspace = "16", follow = false }))
hl.bind("SUPER + SHIFT + ALT + 7", hl.dsp.window.move({ workspace = "17", follow = false }))
hl.bind("SUPER + SHIFT + ALT + 8", hl.dsp.window.move({ workspace = "18", follow = false }))
hl.bind("SUPER + SHIFT + ALT + 9", hl.dsp.window.move({ workspace = "19", follow = false }))
hl.bind("SUPER + SHIFT + ALT + 0", hl.dsp.window.move({ workspace = "20", follow = false }))

-- Special workspaces
hl.bind("CTRL + SUPER + Z",  hl.dsp.workspace.toggle_special("zspace"))
hl.bind("SUPER + Z",         hl.dsp.workspace.toggle_special("zspace"))
hl.bind("SUPER + ALT + Z",   hl.dsp.window.move({ workspace = "special:zspace" }))

hl.bind("CTRL + SUPER + X",  hl.dsp.workspace.toggle_special("xspace"))
hl.bind("SUPER + X",         hl.dsp.workspace.toggle_special("xspace"))
hl.bind("SUPER + ALT + X",   hl.dsp.window.move({ workspace = "special:xspace" }))

hl.bind("CTRL + SUPER + C",  hl.dsp.workspace.toggle_special("cspace"))
hl.bind("SUPER + C",         hl.dsp.workspace.toggle_special("cspace"))
hl.bind("SUPER + ALT + C",   hl.dsp.window.move({ workspace = "special:cspace" }))

-- Scroll through workspaces with (Ctrl+) Super + scroll
hl.bind("SUPER + mouse_up",         hl.dsp.focus({ workspace = "+1" }))
hl.bind("SUPER + mouse_down",       hl.dsp.focus({ workspace = "-1" }))
hl.bind("CTRL + SUPER + mouse_up",  hl.dsp.focus({ workspace = "+1" }))
hl.bind("CTRL + SUPER + mouse_down",hl.dsp.focus({ workspace = "-1" }))

-- Move/resize windows with Super + LMB/RMB and dragging
hl.bind("SUPER + mouse:272", hl.dsp.window.drag(),   { mouse = true })
hl.bind("SUPER + mouse:273", hl.dsp.window.resize(), { mouse = true })
-- hl.bind("SUPER + mouse:274", hl.dsp.window.drag(), { mouse = true })
hl.bind("SUPER + ALT + right", hl.dsp.window.resize({ x = 20,  y = 0,   relative = true }))
hl.bind("SUPER + ALT + left",  hl.dsp.window.resize({ x = -20, y = 0,   relative = true }))
hl.bind("SUPER + ALT + up",    hl.dsp.window.resize({ x = 0,   y = -20, relative = true }))
hl.bind("SUPER + ALT + down",  hl.dsp.window.resize({ x = 0,   y = 20,  relative = true }))
-- hl.bind("CTRL + SUPER + backslash", hl.dsp.window.resize({ x = 640, y = 480 }))

-- Spin monitor
hl.bind("CTRL + SHIFT + ALT + A",     hl.dsp.exec_cmd("~/.config/hypr/executable/spin left"))
hl.bind("CTRL + SHIFT + ALT + S",     hl.dsp.exec_cmd("~/.config/hypr/executable/spin down"))
hl.bind("CTRL + SHIFT + ALT + W",     hl.dsp.exec_cmd("~/.config/hypr/executable/spin up"))
hl.bind("CTRL + SHIFT + ALT + D",     hl.dsp.exec_cmd("~/.config/hypr/executable/spin right"))
hl.bind("CTRL + SHIFT + ALT + Left",  hl.dsp.exec_cmd("~/.config/hypr/executable/spin left"))
hl.bind("CTRL + SHIFT + ALT + Down",  hl.dsp.exec_cmd("~/.config/hypr/executable/spin down"))
hl.bind("CTRL + SHIFT + ALT + Up",    hl.dsp.exec_cmd("~/.config/hypr/executable/spin up"))
hl.bind("CTRL + SHIFT + ALT + Right", hl.dsp.exec_cmd("~/.config/hypr/executable/spin right"))

-- Tag window effects (toggle via dispatch)
hl.bind("SUPER + B", hl.dsp.window.tag({ tag = "blurry" }))
hl.bind("SUPER + N", hl.dsp.window.tag({ tag = "transparent" }))

-- stylua: ignore end
