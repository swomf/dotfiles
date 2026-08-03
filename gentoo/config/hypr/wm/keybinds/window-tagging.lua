-- // all the stuff in here is close to rules.lua, consult that as well.

local function has_tag(window, wanted)
  for _, tag in ipairs(window.tags) do
    if tag == wanted or tag == wanted .. "*" then
      return true
    end
  end

  return false
end

-- pin. pretty good for bringing stuff to arbitrary nonkeybinded workspaces
hl.bind("SUPER + P", hl.dsp.window.pin())

-- blurring
hl.bind("SUPER + B", function()
  local window = hl.get_active_window()
  if not window then
    return
  end

  if has_tag(window, "blurry1") then
    hl.dispatch(hl.dsp.window.tag({ tag = "-blurry1", window = window }))
    hl.dispatch(hl.dsp.window.tag({ tag = "+blurry2", window = window }))
  elseif has_tag(window, "blurry2") then
    hl.dispatch(hl.dsp.window.tag({ tag = "-blurry2", window = window }))
    hl.dispatch(hl.dsp.window.tag({ tag = "+blurry3", window = window }))
  elseif has_tag(window, "blurry3") then
    hl.dispatch(hl.dsp.window.tag({ tag = "-blurry3", window = window }))
  else
    hl.dispatch(hl.dsp.window.tag({ tag = "+blurry1", window = window }))
  end
end)
