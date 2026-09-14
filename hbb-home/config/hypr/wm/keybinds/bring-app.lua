--[[

app              : specify app, as seen in PATH
                   (e.g. easyeffects)
class            : specify class iff different from app,
                   as seen in hyprctl clients
                   (e.g. com.github.wwmm.easyeffects)

--]]

-- expects exact name
local function bring_app(app, class)
  if not class then
    class = app
  end
  for _, w in next, hl.get_windows() do
    if class ~= w.class then
      goto continue -- why the FUCK doesnt lua have continue?
    end
    hl.dispatch(hl.dsp.window.move({ workspace = tostring(hl.get_active_workspace().id), window = w }))
    goto done -- for some reason i cant just return nil here?
    ::continue::
  end
  ::done::
end

hl.bind("SUPER + P", function()
  bring_app("com.github.flxzt.rnote", nil)
end)
