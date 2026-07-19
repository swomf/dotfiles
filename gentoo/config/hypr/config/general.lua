-- MONITOR CONFIG


-- stylua: ignore start
hl.monitor({ output = "",         mode = "preferred",    position = "auto",   scale = 1 })
hl.monitor({ output = "eDP-1",    mode = "2880x1620@120", position = "0x0",    scale = 1.5 })
hl.monitor({ output = "HDMI-A-1", mode = "1920x1080@60", position = "1920x0", scale = 1, mirror = "eDP-1" })
-- hl.monitor({ output = "HDMI-A-1", mode = "1920x1080@75", position = "1920x0", scale = 1 })
-- stylua: ignore end

hl.config({
  xwayland = {
    force_zero_scaling = true,
  },

  input = {
    kb_layout = "us",
    -- kb_options = "grp:win_space_toggle",
    repeat_delay = 250,
    repeat_rate = 35,
    touchpad = {
      disable_while_typing = false,
      scroll_factor = 0.5,
    },
    special_fallthrough = true,
    follow_mouse = 1,
    -- sensitivity = -1,
  },

  binds = {
    -- focus_window_on_workspace_change = true,
    scroll_event_delay = 0,
  },

  general = {
    gaps_in = 2,
    gaps_out = 2,
    gaps_workspaces = 50,
    border_size = 2,
    resize_on_border = true,
    no_focus_fallback = true,
    layout = "dwindle",
    -- focus_to_other_workspaces = true,
    allow_tearing = true, -- just allows the `immediate` window rule to work
  },

  dwindle = {
    -- w/o preserve_split its kinda disorienting imo.
    -- i dont know where stuff will go on win close otherwise.
    preserve_split = true,
    -- i leave my cursor wherever and dont pay attention to it
    -- on workspace setups, so i dont think ill use smart split.
    -- btw smart split implies preserve_split.
    --smart_split = true,
    smart_resizing = false,
  },

  decoration = {
    rounding = 8,
    blur = {
      enabled = true,
      size = 5,
    },
    dim_inactive = false,
    dim_strength = 0.1,
    dim_special = 0,
  },

  animations = {
    enabled = true,
  },

  misc = {
    vrr = 1,
    focus_on_activate = true,
    swallow_regex = "(foot|kitty|allacritty|Alacritty)",
    disable_hyprland_logo = true,
    force_default_wallpaper = 0,
    on_focus_under_fullscreen = 2,
    allow_session_lock_restore = true,
    initial_workspace_tracking = false, -- supposed to be an int... idek what this does
  },
})

hl.config({
  gestures = {
    workspace_swipe_invert = false,
    workspace_swipe_distance = 700,
    workspace_swipe_cancel_ratio = 0.2,
    workspace_swipe_min_speed_to_force = 5,
    workspace_swipe_direction_lock = true,
    workspace_swipe_direction_lock_threshold = 10,
    workspace_swipe_create_new = true,
  },
})


-- stylua: ignore start

-- Bezier curves
hl.curve("linear",        { type = "bezier", points = { {0, 0},      {1, 1}      } })
hl.curve("md3_standard",  { type = "bezier", points = { {0.2, 0},    {0, 1}      } })
hl.curve("md3_decel",     { type = "bezier", points = { {0.05, 0.7}, {0.1, 1}    } })
hl.curve("md3_accel",     { type = "bezier", points = { {0.3, 0},    {0.8, 0.15} } })
hl.curve("overshot",      { type = "bezier", points = { {0.05, 0.9}, {0.1, 1.1}  } })
hl.curve("crazyshot",     { type = "bezier", points = { {0.1, 1.5},  {0.76, 0.92}} })
hl.curve("hyprnostretch", { type = "bezier", points = { {0.05, 0.9}, {0.1, 1.0}  } })
hl.curve("menu_decel",    { type = "bezier", points = { {0.1, 1},    {0, 1}      } })
hl.curve("menu_accel",    { type = "bezier", points = { {0.38, 0.04},{1, 0.07}   } })
hl.curve("easeInOutCirc", { type = "bezier", points = { {0.85, 0},   {0.15, 1}   } })
hl.curve("easeOutCirc",   { type = "bezier", points = { {0, 0.55},   {0.45, 1}   } })
hl.curve("easeOutExpo",   { type = "bezier", points = { {0.16, 1},   {0.3, 1}    } })
hl.curve("softAcDecel",   { type = "bezier", points = { {0.26, 0.26},{0.15, 1}   } })
hl.curve("md2",           { type = "bezier", points = { {0.4, 0},    {0.2, 1}    } })

-- Animations
hl.animation({ leaf = "windows",       enabled = true,  speed = 3,   bezier = "md3_decel",  style = "popin 60%" })
hl.animation({ leaf = "windowsIn",     enabled = true,  speed = 3,   bezier = "md3_decel",  style = "popin 60%" })
hl.animation({ leaf = "windowsOut",    enabled = true,  speed = 3,   bezier = "md3_accel",  style = "popin 60%" })
hl.animation({ leaf = "border",        enabled = true,  speed = 10,  bezier = "default" })
hl.animation({ leaf = "fade",          enabled = true,  speed = 3,   bezier = "md3_decel" })
-- hl.animation({ leaf = "layers",     enabled = true,  speed = 2,   bezier = "md3_decel",  style = "slide" })
hl.animation({ leaf = "layersIn",      enabled = true,  speed = 3,   bezier = "menu_decel", style = "slide" })
hl.animation({ leaf = "layersOut",     enabled = true,  speed = 1.6, bezier = "menu_accel" })
hl.animation({ leaf = "fadeLayersIn",  enabled = true,  speed = 2,   bezier = "menu_decel" })
hl.animation({ leaf = "fadeLayersOut", enabled = true,  speed = 4.5, bezier = "menu_accel" })
hl.animation({ leaf = "workspaces",    enabled = true,  speed = 7,   bezier = "menu_decel", style = "slide" }) -- also see config.keybinds.workspaces

-- hl.animation({ leaf = "workspaces", enabled = true, speed = 2.5, bezier = "softAcDecel", style = "slide" })
-- hl.animation({ leaf = "workspaces", enabled = true, speed = 7,   bezier = "menu_decel",  style = "slidefade 15%" })
-- hl.animation({ leaf = "specialWorkspace", enabled = true, speed = 3, bezier = "md3_decel", style = "slidefadevert 15%" })
--hl.animation({ leaf = "specialWorkspace", enabled = true, speed = 3, bezier = "md3_decel", style = "slidevert" })

-- stylua: ignore end
