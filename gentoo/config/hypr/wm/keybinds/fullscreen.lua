--[[
    -1	Current    	Maintains the current fullscreen state.
     0	None	      Window allocates the space defined by the current layout.
     1	Maximized	  Window takes up the entire working space, keeping the margins.
     2	Fullscreen  Window takes up the entire screen.
     internal is wrt_screen/hyprland
]]

-- resolve state machine
local function next_fullscreenstate(wrt)
  local win = hl.get_active_window()
  if not win then
    return
  end
  local tbl = {}
  local current_wrt_window = win.fullscreen_client
  local current_wrt_screen = win.fullscreen
  if wrt == "wrt_window" then
    -- fills compositor but doesnt block the reserved spaces
    tbl = {
      internal = -1,
      client = current_wrt_window == 2 and 0 or 2,
    }
  elseif wrt == "wrt_screen" then
    -- convinces the window that its filled
    tbl = {
      internal = current_wrt_screen == 1 and 0 or 1,
      client = -1,
    }
  elseif wrt == "wrt_all" then
    -- only unfulls if already all full
    local is_all_full = current_wrt_window + current_wrt_screen == 4
    tbl = {
      internal = is_all_full and 0 or 2,
      client = is_all_full and 0 or 2,
    }
  end
  hl.dispatch(hl.dsp.window.fullscreen_state(tbl))
end

hl.bind("F11", function()
  next_fullscreenstate("wrt_all")
end)
hl.bind("SHIFT + F11", function()
  next_fullscreenstate("wrt_screen")
end)
hl.bind("SUPER + F11", function()
  next_fullscreenstate("wrt_window")
end)
