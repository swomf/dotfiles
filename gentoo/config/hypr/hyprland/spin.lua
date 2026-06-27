-- FIXME: with multiple monitors, spinning arbitrarily may cause collision
--        (cursor visible on both monitors)

local HOME = os.getenv("HOME")

local wallpapers = {
  [0] = HOME .. "/.config/hypr/assets/lagtrain.png",
  [1] = HOME .. "/.config/hypr/assets/rainyboots.png",
  [2] = HOME .. "/.config/hypr/assets/lagtrain.png",
  [3] = HOME .. "/.config/hypr/assets/rainyboots.png",
}

local function get_mon()
  local ws = hl.get_active_workspace()
  return (ws and ws.monitor) or hl.get_active_monitor()
end

local function apply(mon, transform)
  hl.monitor({
    output = mon.name,
    mode = string.format("%dx%d@%.3f", mon.width, mon.height, mon.refresh_rate),
    position = "0x0",
    scale = mon.scale,
    transform = transform,
  })
  -- Delay so the rotation settles before hyprpaper gets the new geometry
  hl.timer(function()
    hl.dispatch(hl.dsp.exec_cmd(string.format("hyprctl hyprpaper wallpaper '%s,%s'", mon.name, wallpapers[transform])))
  end, { timeout = 150, type = "oneshot" })
end

local M = {}

function M.down()
  local m = get_mon()
  if m then
    apply(m, 0)
  end
end
function M.right()
  local m = get_mon()
  if m then
    apply(m, 1)
  end
end
function M.up()
  local m = get_mon()
  if m then
    apply(m, 2)
  end
end
function M.left()
  local m = get_mon()
  if m then
    apply(m, 3)
  end
end

-- counterclockwise 0->3->2->1->0
function M.ccw()
  local m = get_mon()
  if not m then
    return
  end
  apply(m, (m.transform - 1 + 4) % 4)
end

return M
