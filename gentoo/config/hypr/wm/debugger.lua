-- not actually a fan of using hyprland's notify
-- since theres no cancel button

local debugger = {}
function debugger.notify_timed(txt, ms)
  hl.notification.create({
    text = txt,
    color = "0xffff8800",
    timeout = ms,
  })
end
function debugger.notify(txt)
  debugger.notify_timed(txt, 2000)
end

hl.notification.create({
  text = "DEBUGGER IS ON",
  color = "0xffff0000",
  timeout = 1500,
  font_size = 20,
})

return debugger
