--[[
I have a unique grid setup for my workspaces where
+-20-based movement causes a slide-up/down animation.
  (also has some window logic if the keybinds are pleasant to generate)
This depends on a Hyprland patch that is discussed on my website:
https://funroll.swomf.com/conf/desktop

VERBS
=====
super, wrt number keys:
  alt     ---> nofollow/send
  control ---> follow/bring
  shift   ---> intensify -- 11 to 20 instead of 1 to 10 (0 denotes 10)

super, wrt wasd/arrow keys:
  nothing           ---> switch window
  shift             ---> swap window
  control           ---> hop workspace
  control+shift     ---> swap window+hop workspace

also a section on gestures based on my hyprland patch.
--]]

local workspacer = {}

-- the main annoying thing: all workspace switches need to be slide-direction aware
-- (default slide is horizontal as declared in general.lua)
-- make sure to set this to default false once an anim is set into motion
-- (you will need to call it in pairs basically)
function workspacer.declare_vertical_slide(bool)
  hl.animation({
    leaf = "workspaces",
    enabled = true,
    speed = 7,
    bezier = "menu_decel",
    -- toggle correct grid direction animation
    style = (bool and "slidevert") or "slide",
  })
end

function workspacer.vertical_slide_modulo_20(goal_i)
  local ws = hl.get_active_workspace()
  workspacer.declare_vertical_slide(ws and (ws.id - goal_i) % 20 == 0)
end

-- // SUPER WRT NUMBER KEYS
for i = 1, 20 do
  local function build_shiftnumber_bind(id)
    -- 1..10 -> 1..0 and 11...20 -> 1..0
    local s = "SUPER + "
    return (id <= 10 and s .. tostring(id % 10)) or s .. "SHIFT + " .. tostring(id % 10)
  end
  -- workspace switch by number keys
  hl.bind(build_shiftnumber_bind(i), function()
    workspacer.vertical_slide_modulo_20(i)
    hl.dispatch(hl.dsp.focus({ workspace = tostring(i) }))
    workspacer.declare_vertical_slide(false)
  end)
  -- move window to workspace (follow)
  hl.bind("CTRL + " .. build_shiftnumber_bind(i), function()
    workspacer.vertical_slide_modulo_20(i)
    hl.dispatch(hl.dsp.window.move({ workspace = tostring(i) }))
    workspacer.declare_vertical_slide(false)
  end)
  -- move window to workspace silently (no follow)
  hl.bind("ALT + " .. build_shiftnumber_bind(i), function()
    workspacer.vertical_slide_modulo_20(i)
    hl.dispatch(hl.dsp.window.move({ workspace = tostring(i), follow = false }))
    workspacer.declare_vertical_slide(false)
  end)
end

-- // SUPER WRT WASD
local gridnav = {
  ["directions"] = { "u", "l", "d", "r" },
  ["u"] = { { "up", "W" }, "-20", true },
  ["l"] = { { "left", "A" }, "-1", false },
  ["d"] = { { "down", "S" }, "+20", true },
  ["r"] = { { "right", "D" }, "+1", false },
}
function gridnav.smart_anim_func(dir, lambda)
  return function()
    -- guard to avoid -20ing into workspace 1
    local ws = hl.get_active_workspace()
    if ws and ws.id <= 20 and dir == "u" then
      return
    end
    workspacer.declare_vertical_slide(gridnav[dir][3])
    -- hacky since focus doesnt take follow=true
    hl.dispatch(lambda({ workspace = gridnav[dir][2], follow = true }))
    workspacer.declare_vertical_slide(false)
  end
end
for _, direction in next, gridnav.directions do
  for _, button in next, gridnav[direction][1] do
    -- move focus
    hl.bind("SUPER + " .. button, hl.dsp.focus({ direction = direction }))
    -- swap windows
    hl.bind("SUPER + SHIFT + " .. button, hl.dsp.window.move({ direction = direction }))
    -- hop workspace
    hl.bind("CTRL + SUPER + " .. button, gridnav.smart_anim_func(direction, hl.dsp.focus))
    -- swap windows + hop workspace
    hl.bind("CTRL + SHIFT + SUPER + " .. button, gridnav.smart_anim_func(direction, hl.dsp.window.move))
  end
end
-- hl.bind("SUPER + mouse:275",           hl.dsp.focus({ workspace = "-1" }))
-- hl.bind("SUPER + mouse:276",           hl.dsp.focus({ workspace = "+1" }))

-- // special workspaces
for _, id in next, { "Z", "X", "C" } do
  hl.bind("SUPER + " .. id, function()
    workspacer.declare_vertical_slide(true)
    hl.dispatch(hl.dsp.workspace.toggle_special(id .. "space"))
    workspacer.declare_vertical_slide(false)
  end)
  hl.bind("SUPER + ALT + " .. id, function()
    workspacer.declare_vertical_slide(true)
    hl.dispatch(hl.dsp.window.move({ workspace = "special:" .. id .. "space", follow = false }))
    workspacer.declare_vertical_slide(false)
  end)
end

-- Scroll through workspaces with (Ctrl+) Super + scroll
hl.bind("SUPER + mouse_up", hl.dsp.focus({ workspace = "+1" }))
hl.bind("SUPER + mouse_down", hl.dsp.focus({ workspace = "-1" }))

-- // GRID-LIKE WORKSPACE GESTURES

local WS_PER_ROW = 20

-- >>> THIS IS NOT STOCK HYPRLAND!!!! <<<
hl.gesture({ fingers = 4, direction = "horizontal", action = "workspace" })
hl.gesture({ fingers = 4, direction = "vertical", action = "workspace", step = WS_PER_ROW })
-- >>> THAT WAS NOT STOCK HYPRLAND!!! <<<

--[[ fallback
(vertical gesture only swipes AFTER)
local function set_ws_style(style)
  hl.animation({ leaf = "workspaces", enabled = true, speed = 7, bezier = "menu_decel", style = style })
end
local function ws_row(delta)
  local ws = hl.get_active_workspace()
  if not ws then return end
  local target = ws.id + delta
  if target < 1 then return end
  workspacer.declare_vertical_slide(true)
  hl.dispatch(hl.dsp.focus({ workspace = tostring(target) }))
  workspacer.declare_vertical_slide(false)
end
hl.gesture({ fingers = 4, direction = "horizontal", action = "workspace" })
hl.gesture({ fingers = 4, direction = "up",   action = function() ws_row(-WS_PER_ROW) end })
hl.gesture({ fingers = 4, direction = "down", action = function() ws_row( WS_PER_ROW) end })
--]]

return workspacer
