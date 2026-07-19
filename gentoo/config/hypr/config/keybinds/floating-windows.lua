local function togglefloat_center()
  local win = hl.get_active_window()
  if not win then
    return
  end
  if win.floating then
    hl.dispatch(hl.dsp.window.float({ action = "toggle" }))
    return
  end
  local mon = hl.get_active_monitor()
  local w = mon and math.floor(mon.width / mon.scale * 0.8)
  local h = mon and math.floor(mon.height / mon.scale * 0.8)
  hl.dispatch(hl.dsp.window.float({ action = "toggle" }))
  hl.dispatch(hl.dsp.window.resize({ x = w, y = h }))
  hl.dispatch(hl.dsp.window.center())
end

-- Toggle tiled->float (grow: float preserving tiled position/size, inset 4px for borders)
local function togglefloat_grow()
  local win = hl.get_active_window()
  if not win then
    return
  end
  if win.floating then
    hl.dispatch(hl.dsp.window.float({ action = "toggle" }))
    return
  end
  local at, size = win.at, win.size
  local x = type(at) == "table" and (at.x or at[1]) or 0
  local y = type(at) == "table" and (at.y or at[2]) or 0
  local w = type(size) == "table" and (size.x or size[1]) or 0
  local h = type(size) == "table" and (size.y or size[2]) or 0
  hl.dispatch(hl.dsp.window.float({ action = "toggle" }))
  hl.dispatch(hl.dsp.window.resize({ x = w - 8, y = h - 8 }))
  hl.dispatch(hl.dsp.exec_cmd(string.format("hyprctl dispatch moveactive exact %d %d", x + 4, y + 4)))
end

hl.bind("SHIFT + ALT + F", togglefloat_center)
hl.bind("SHIFT + SUPER + F", togglefloat_grow)
hl.bind("SHIFT + SUPER + ALT + F", togglefloat_center)
hl.bind("CTRL + SHIFT + ALT + F", function()
  hl.dispatch(hl.dsp.window.float({ action = "toggle" }))
  hl.dispatch(hl.dsp.window.resize({ x = 640, y = 480 }))
end)
