for _, w in next, hl.get_windows() do
  -- hyprctl eval "$(cat ~/.config/hypr/executable/organize-workspaces.lua)"

  -- "class": "firefox",
  -- "address": a quoted hexadecimal in the form 0x___,
  -- "title": either "[int] text" or "text"

  local id = w.title:match("%[%d%].+")
  if id then
    id = id:gsub("%].+", ""):gsub("%[", "")
    hl.dispatch(hl.dsp.window.move({
      workspace = id,
      window = "address:" .. w.address,
      follow = false,
    }))
  end
end
