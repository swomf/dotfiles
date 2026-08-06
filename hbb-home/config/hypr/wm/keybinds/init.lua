require("wm.keybinds.workspaces")
require("wm.keybinds.pocket-femtanyl")
require("wm.keybinds.spin-monitor")
require("wm.keybinds.floating-windows")
require("wm.keybinds.goto-app")
require("wm.keybinds.fullscreen")

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
hl.bind("CTRL + SHIFT + Escape", hl.dsp.exec_cmd("foot -T btop -- btop", {float = true, size = { 1400, 800 }}))

-- Actions
hl.bind("SUPER + comma",  hl.dsp.exec_cmd("pkill fuzzel || ~/git/fuzzel-math/fuzzel-math"))
hl.bind("SUPER + Q",      hl.dsp.window.close())
hl.bind("ALT + F4",       hl.dsp.window.close())
hl.bind("SHIFT + SUPER + ALT + Q", hl.dsp.exec_cmd("hyprctl kill"))

-- Screenshot, Record, OCR, Color picker, Clipboard history
-- slurp picks the region, grim screenshots a geometry, swappy edits a picture
hl.bind("Print",         hl.dsp.exec_cmd('grim -g "$(slurp)" - | swappy -f -'))
hl.bind("CTRL + Print",  hl.dsp.exec_cmd('grim - | wl-copy && notify-send "Screenshot copied to clipboard" "grim - | wl-copy" --app-name="screenshot" -t 2000'))
hl.bind("SUPER + V",     hl.dsp.exec_cmd("cliphist list | ~/.config/ags/runner/choose | cliphist decode | wl-copy"))
hl.bind("SHIFT + Print", hl.dsp.exec_cmd("~/.config/hypr/executable/post-hoc-screenshot"))

-- Image-to-text
hl.bind("SUPER + SHIFT + T", hl.dsp.exec_cmd('grim -g "$(slurp)" - | tesseract stdin stdout -l eng+jpn | wl-copy'))

-- Lock screen
hl.bind("SUPER + L",        hl.dsp.exec_cmd("~/.config/hypr/executable/hyprlock"))
hl.bind("CTRL + SUPER + L", hl.dsp.exec_cmd("hyprlock -c ~/.config/hypr/hyprlock-encrypted.conf"))

-- ags stuff
-- see ~/.config/ags/runner/providers/emojidata/update-emoji-data
hl.bind("SUPER + R", hl.dsp.exec_cmd("ags request runner"))
hl.bind("SUPER + period", hl.dsp.exec_cmd("ags request runner emoji"))
hl.bind("SUPER + U", hl.dsp.exec_cmd("ags request runner unicode"))
hl.bind("SUPER + Tab", hl.dsp.exec_cmd("ags request notifications")) -- might combine into an "overlay"
hl.bind("SUPER + M", hl.dsp.exec_cmd("ags request runner rink")) -- measurement

-- ########################### misc Hyprland window/workspace binds ############################

-- Window split ratio
hl.bind("SUPER + minus",      hl.dsp.layout("splitratio -0.1"), { repeating = true })
hl.bind("SUPER + equal",      hl.dsp.layout("splitratio 0.1"),  { repeating = true })
hl.bind("SUPER + semicolon",  hl.dsp.layout("splitratio -0.1"), { repeating = true })
hl.bind("SUPER + apostrophe", hl.dsp.layout("splitratio 0.1"),  { repeating = true })

-- stylua: ignore end

-- Alt+Tab window cycling
hl.bind("ALT + Tab", function()
  hl.dispatch(hl.dsp.window.cycle_next())
  hl.dispatch(hl.dsp.window.alter_zorder({ mode = "top" }))
end)
hl.bind("SHIFT + ALT + Tab", function()
  hl.dispatch(hl.dsp.window.cycle_next({ next = false }))
  hl.dispatch(hl.dsp.window.alter_zorder({ mode = "top" }))
end)

-- Move/resize windows with Super + LMB/RMB and dragging
hl.bind("SUPER + mouse:272", hl.dsp.window.drag(), { mouse = true })
hl.bind("SUPER + mouse:273", hl.dsp.window.resize(), { mouse = true })

--[[ // too awkward of a finger position
-- hl.bind("SUPER + mouse:274", hl.dsp.window.drag(), { mouse = true })
hl.bind("SUPER + ALT + right", hl.dsp.window.resize({ x = 20,  y = 0,   relative = true }), {repeating = true})
hl.bind("SUPER + ALT + left",  hl.dsp.window.resize({ x = -20, y = 0,   relative = true }), {repeating=true})
hl.bind("SUPER + ALT + up",    hl.dsp.window.resize({ x = 0,   y = -20, relative = true }), {repeating=true})
hl.bind("SUPER + ALT + down",  hl.dsp.window.resize({ x = 0,   y = 20,  relative = true }), {repeating=true})
hl.bind("SUPER + ALT + D",     hl.dsp.window.resize({ x = 20,  y = 0,   relative = true }), {repeating = true})
hl.bind("SUPER + ALT + A",     hl.dsp.window.resize({ x = -20, y = 0,   relative = true }), {repeating=true})
hl.bind("SUPER + ALT + W",     hl.dsp.window.resize({ x = 0,   y = -20, relative = true }), {repeating=true})
hl.bind("SUPER + ALT + S",     hl.dsp.window.resize({ x = 0,   y = 20,  relative = true }), {repeating=true})
-- hl.bind("CTRL + SUPER + backslash", hl.dsp.window.resize({ x = 640, y = 480 }))
]]

-- tag window effects (see rules.lua)
hl.bind("SUPER + B", hl.dsp.window.tag({ tag = "blurry" }))
hl.bind("SUPER + N", hl.dsp.window.tag({ tag = "transparent" }))
hl.bind("SUPER + P", hl.dsp.window.pin())
