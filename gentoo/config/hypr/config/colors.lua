hl.config({
  general = {
    col = {
      active_border = "rgba(ffffffff)",
      inactive_border = "rgba(A58A8D30)",
    },
  },
  misc = {
    background_color = "rgba(19191AFF)",
  },
})

-- pinned window border
hl.window_rule({ match = { pin = true }, border_color = "rgba(FFB2BCAA) rgba(FFB2BC77)" })
