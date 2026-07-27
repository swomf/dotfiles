-- ######## Window rules ########

-- noblur: notetaking
hl.window_rule({ match = { class = "^(com.github.xournalpp.xournalpp)$" }, no_blur = true })
hl.window_rule({ match = { class = "^(evince.*)$" }, no_blur = true })
hl.window_rule({ match = { class = "^(firefox.*)$" }, no_blur = true })
hl.window_rule({ match = { class = "^(gimp.*)$" }, no_blur = true })
hl.window_rule({ match = { class = "^(krita)$" }, no_blur = true })
hl.window_rule({ match = { class = "^(org.musescore.*)$" }, no_blur = true })
-- noblur: image stuff
hl.window_rule({ match = { class = "^(Nsxiv)$" }, no_blur = true })
hl.window_rule({ match = { class = "^(ristretto)$" }, no_blur = true })
hl.window_rule({ match = { class = "^(swappy)$" }, no_blur = true })

-- Tags
hl.window_rule({ match = { tag = "blurry" }, opacity = "0.6 override" })
hl.window_rule({ match = { tag = "transparent" }, opacity = "0.4 override", no_blur = true })

-- Decorative overlays
hl.window_rule({ match = { title = "rule-of-thirds" }, no_blur = true })

-- Dialogs
hl.window_rule({ match = { title = "^(Open File)(.*)$" }, float = true })
hl.window_rule({ match = { title = "^(Select a File)(.*)$" }, float = true })
hl.window_rule({ match = { title = "^(Choose wallpaper)(.*)$" }, float = true })
hl.window_rule({ match = { title = "^(Open Folder)(.*)$" }, float = true })
hl.window_rule({ match = { title = "^(Save As)(.*)$" }, float = true })
hl.window_rule({ match = { title = "^(Library)(.*)$" }, float = true })

-- Floaters
hl.window_rule({ match = { initial_class = "^com.github.wwmm.easyeffects$" }, float = true, size = { 1400, 800 } })
hl.window_rule({
  match = { initial_title = "^Picture-in-Picture$" },
  float = true,
  size = { 1400, 800 },
  suppress_event = "fullscreen maximize activate activatefocus fullscreenoutput x11configurerequest", -- stay in the TIMEOUT corner dammit
})

-- Tearing
hl.window_rule({ match = { class = ".*\\.exe" }, immediate = true })
hl.window_rule({ match = { class = "steam_app" }, immediate = true })

-- Fix for Gimp (bug causes cursor to lock at center of window when changing brush color)
hl.window_rule({ match = { class = "^(gimp.*)$" }, suppress_event = "activatefocus activate" })

-- ######## Layer rules ########
hl.layer_rule({ match = { namespace = "selection" }, no_anim = true }) -- e.g. slurp
hl.layer_rule({ match = { namespace = "anyrun" }, no_anim = true })
hl.layer_rule({ match = { namespace = "launcher" }, no_anim = true }) -- fuzzel
hl.layer_rule({ match = { namespace = "indicator.*" }, no_anim = true })
hl.layer_rule({ match = { namespace = "hyprpicker" }, no_anim = true })

hl.layer_rule({ match = { namespace = "noanim" }, no_anim = true })
hl.layer_rule({ match = { namespace = "gtk-layer-shell" }, ignore_alpha = 0 })
hl.layer_rule({ match = { namespace = "launcher" }, ignore_alpha = 0.5 })
hl.layer_rule({ match = { namespace = "notifications" }, ignore_alpha = 0.69 })
