-- ######### Input method ##########
-- See https://fcitx-im.org/wiki/Using_Fcitx_5_on_Wayland
hl.env("QT_IM_MODULE", "fcitx")
hl.env("XMODIFIERS", "@im=fcitx")

hl.env("SDL_IM_MODULE", "fcitx")
hl.env("GLFW_IM_MODULE", "ibus")
hl.env("INPUT_METHOD", "fcitx")

-- ############ Themes #############
hl.env("QT_QPA_PLATFORM", "wayland")
hl.env("HYPRCURSOR_THEME", "Blackbriar")
hl.env("HYPRCURSOR_SIZE", "24")
hl.env("ELECTRON_OZONE_PLATFORM_HINT", "auto")
hl.env("QT_QPA_PLATFORMTHEME", "qt6ct")
hl.env("QT_STYLE_OVERRIDE", "kvantum")

-- ######## Screen tearing #########

-- ############ Others #############
hl.env("NIXPKGS_ALLOW_UNFREE", "1")

-- ############ i915 bug ###########
-- mesa issue 3748
-- (playing Terraria can crash all of Hyprland)
hl.env("INTEL_DEBUG", "reemit")
