local config_dir = os.getenv("HOME") .. "/.config/hypr"

local function module_exists(name)
  local path = name:gsub("[./]", "/")
  local f = io.open(config_dir .. "/" .. path .. ".lua", "r")
  if f then
    f:close()
    return true
  end
  f = io.open(config_dir .. "/" .. path .. "/init.lua", "r")
  if f then
    f:close()
    return true
  end
  return false
end

-- safe_require is kinda useless but im just making sure im not stupid
-- (happens)
local function safe_require(file)
  if not module_exists(file) then
    hl.notification.create({ text = "conf file not found: " .. file, color = "0xffff8800", timeout = 10000 })
    return
  end
  local ok, err = pcall(require, file)
  if not ok then
    hl.notification.create({ text = "conf error in " .. file .. ": " .. err, color = "0xffff0000", timeout = 10000 })
  end
end

safe_require("hyprland.env")
safe_require("hyprland.execs")
safe_require("hyprland.general")
safe_require("hyprland.rules")
safe_require("hyprland.colors")
safe_require("hyprland.keybinds")
