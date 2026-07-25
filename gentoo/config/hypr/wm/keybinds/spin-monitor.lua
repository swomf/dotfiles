-- FIXME: with multiple monitors, spinning arbitrarily may cause collision
--        (cursor visible on both monitors)

local HOME = os.getenv("HOME")

local wallpapers = {
  [0] = HOME .. "/.config/hypr/assets/lagtrain.png",
  [1] = HOME .. "/.config/hypr/assets/rainyboots.png",
  [2] = HOME .. "/.config/hypr/assets/lagtrain.png",
  [3] = HOME .. "/.config/hypr/assets/rainyboots.png",
}

local transforms = {
  S = 0,
  Down = 0,
  D = 1,
  Right = 1,
  W = 2,
  Up = 2,
  A = 3,
  Left = 3,
}

local function transform_monitor(transform)
  local ws = hl.get_active_workspace()
  local mon = ws and ws.monitor or hl.get_active_monitor()
  if not mon then
    return
  end

  hl.monitor({
    output = mon.name,
    mode = ("%dx%d@%.3f"):format(mon.width, mon.height, mon.refresh_rate),
    position = "0x0",
    scale = mon.scale,
    transform = transform,
  })

  hl.timer(function()
    hl.dispatch(hl.dsp.exec_cmd(("hyprctl hyprpaper wallpaper %q"):format(mon.name .. "," .. wallpapers[transform])))
  end, { timeout = 150, type = "oneshot" })
end

for key, transform in pairs(transforms) do
  hl.bind("CTRL + SHIFT + ALT + " .. key, function()
    transform_monitor(transform)
  end)
end
