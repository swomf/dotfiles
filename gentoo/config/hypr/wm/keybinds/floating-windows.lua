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

-- float with push inward slightly.
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
  hl.dispatch(hl.dsp.window.float({ action = "toggle" }))
  hl.dispatch(hl.dsp.window.resize({ x = size.x - 8, y = size.y - 8 }))
  hl.dispatch(hl.dsp.window.move({ x = at.x + 4, y = at.y + 4 }))
end

hl.bind("SHIFT + ALT + F", togglefloat_center)
hl.bind("SHIFT + SUPER + F", togglefloat_grow)
hl.bind("SHIFT + SUPER + ALT + F", togglefloat_center)
hl.bind("CTRL + SHIFT + ALT + F", function()
  hl.dispatch(hl.dsp.window.float({ action = "toggle" }))
  hl.dispatch(hl.dsp.window.resize({ x = 640, y = 480 }))
end)
