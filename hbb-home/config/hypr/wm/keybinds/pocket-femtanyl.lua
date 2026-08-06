-- https://github.com/swomf/pocket-femtanyl
local femtanyl_movement = {
  W = "up",
  A = "left",
  S = "down",
  D = "right",
}

for key, direction in pairs(femtanyl_movement) do
  hl.bind(key, hl.dsp.event("femtanyl:" .. direction .. ":down"), {
    -- release = false
    non_consuming = true,
    transparent = true,
    ignore_mods = true,
  })

  hl.bind(key, hl.dsp.event("femtanyl:" .. direction .. ":up"), {
    release = true,
    non_consuming = true,
    transparent = true,
    ignore_mods = true,
  })
end
