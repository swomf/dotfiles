-- ######## Window rules ########

-- stylua: ignore start

-- noblur: windowrule = noblur,.*  (uncomment to apply globally)
hl.window_rule({ match = { class = "^(org.musescore.*)$" }, no_blur = true }) -- music transcription
hl.window_rule({ match = { class = "^(com.github.xournalpp.xournalpp)$" }, no_blur = true }) -- note-taking
hl.window_rule({ match = { class = "^(swappy)$" }, no_blur = true }) -- pic
hl.window_rule({ match = { class = "^(Nsxiv)$" }, no_blur = true }) -- pic
hl.window_rule({ match = { class = "^(krita)$" }, no_blur = true }) -- practice drawing
hl.window_rule({ match = { class = "^(ristretto)$" }, no_blur = true })
hl.window_rule({ match = { class = "^(org.vinegarhq.Sober)$" }, no_blur = true })
hl.window_rule({ match = { class = "^(firefox.*)$" }, no_blur = true }) -- overlay videos
hl.window_rule({ match = { class = "^(Mullvad Browser)$" }, no_blur = true }) -- overlay videos
-- hl.window_rule({ match = { class = ".*" }, opacity = "0.89 override 0.89 override" })   -- all windows transparent
hl.window_rule({ match = { class = "^(blueberry.py)$" }, float = true })
hl.window_rule({ match = { class = "^(steam)$" }, float = true })
hl.window_rule({ match = { class = "^(guifetch)$" }, float = true }) -- FlafyDev/guifetch
hl.window_rule({ match = { class = "^(gimp.*)$" }, no_blur = true })
hl.window_rule({ match = { class = "^(evince.*)$" }, no_blur = true })
hl.window_rule({ match = { class = "dev.warp.Warp" }, tile = true })
-- hl.window_rule({ match = { class = "foot" }, opacity = "0.9 0.6" })

-- Tags
hl.window_rule({ match = { tag = "blurry" }, opacity = "0.6 override" })
hl.window_rule({ match = { tag = "transparent" }, opacity = "0.4 override" })
hl.window_rule({ match = { tag = "transparent" }, no_blur = true })

-- Decorative overlays
hl.window_rule({ match = { title = "piece-of-glass" }, no_blur = true })
hl.window_rule({ match = { title = "piece-of-glass" }, border_color = "rgb(000000)" })
hl.window_rule({ match = { title = "piece-of-glass" }, border_size = 1 })
hl.window_rule({ match = { title = "piece-of-glass" }, decorate = true })
hl.window_rule({ match = { title = "rule-of-thirds" }, no_blur = true })

-- Dialogs
hl.window_rule({ match = { title = "^(Open File)(.*)$" }, float = true })
hl.window_rule({ match = { title = "^(Select a File)(.*)$" }, float = true })
hl.window_rule({ match = { title = "^(Choose wallpaper)(.*)$" }, float = true })
hl.window_rule({ match = { title = "^(Open Folder)(.*)$" }, float = true })
hl.window_rule({ match = { title = "^(Save As)(.*)$" }, float = true })
hl.window_rule({ match = { title = "^(Library)(.*)$" }, float = true })

-- Tearing
hl.window_rule({ match = { class = ".*\\.exe" }, immediate = true })
hl.window_rule({ match = { class = "steam_app" }, immediate = true })

-- No shadow for tiled windows
hl.window_rule({ match = { float = false }, no_shadow = true })

-- Fix for Gimp (bug causes cursor to lock at center of window when changing brush color)
hl.window_rule({ match = { class = "^(gimp.*)$" }, suppress_event = "activatefocus activate" })

-- ######## Layer rules ########
hl.layer_rule({ match = { namespace = ".*" }, xray = true })
-- hl.layer_rule({ match = { namespace = ".*"         }, no_anim = true })
hl.layer_rule({ match = { namespace = "walker" }, no_anim = true })
hl.layer_rule({ match = { namespace = "selection" }, no_anim = true }) -- e.g. slurp
hl.layer_rule({ match = { namespace = "anyrun" }, no_anim = true })
hl.layer_rule({ match = { namespace = "launcher" }, no_anim = true }) -- fuzzel
hl.layer_rule({ match = { namespace = "indicator.*" }, no_anim = true })
hl.layer_rule({ match = { namespace = "hyprpicker" }, no_anim = true })
-- hl.layer_rule({ match = { namespace = "shell:.*"   }, blur = true })
hl.layer_rule({ match = { namespace = "shell:.*" }, ignore_alpha = 0.6 })

hl.layer_rule({ match = { namespace = "noanim" }, no_anim = true })
-- hl.layer_rule({ match = { namespace = "gtk-layer-shell" }, blur = true })
hl.layer_rule({ match = { namespace = "gtk-layer-shell" }, ignore_alpha = 0 })
-- hl.layer_rule({ match = { namespace = "launcher"   }, blur = true })
hl.layer_rule({ match = { namespace = "launcher" }, ignore_alpha = 0.5 })
-- hl.layer_rule({ match = { namespace = "notifications" }, blur = true })
hl.layer_rule({ match = { namespace = "notifications" }, ignore_alpha = 0.69 })

-- stylua: ignore end
