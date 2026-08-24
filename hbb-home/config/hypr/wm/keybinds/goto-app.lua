--[[

app              : specify app, as seen in PATH
                   (e.g. easyeffects)
class            : specify class iff different from app,
                   as seen in hyprctl clients
                   (e.g. com.github.wwmm.easyeffects)
send_to_workspace: sends focused app to the found workspace instead

--]]

local workspacer = require("wm.keybinds.grid-workspaces")

-- expects exact name
local function goto_app(app, class, send_to_workspace)
  if not class then
    class = app
  end
  for _, w in next, hl.get_windows() do
    if class ~= w.class then
      goto continue -- why the FUCK doesnt lua have continue?
    end
    local id = w.workspace and w.workspace.id
    workspacer.vertical_slide_modulo_20(id)
    if send_to_workspace then
      hl.dispatch(hl.dsp.window.move({ workspace = tostring(id), follow = false }))
    else
      hl.dispatch(hl.dsp.focus({ workspace = tostring(id) }))
    end
    workspacer.declare_vertical_slide(false)
    goto done -- for some reason i cant just return nil here?
    ::continue::
  end
  -- if didnt find app
  hl.exec_cmd(app)
  ::done::
end

hl.bind("SUPER + O", function()
  goto_app("obsidian", nil, false)
end)
hl.bind("SUPER + ALT + O", function()
  goto_app("obsidian", nil, true)
end)
-- hl.bind("CTRL + SUPER + V",  hl.dsp.exec_cmd("pavucontrol"))
hl.bind("CTRL + SHIFT + SUPER + V", function()
  goto_app("easyeffects", "com.github.wwmm.easyeffects", false) -- TODO: add rules as layered in
end)
