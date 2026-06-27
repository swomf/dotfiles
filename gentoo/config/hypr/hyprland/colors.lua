-- exec = export SLURP_ARGS='-d -c FFDAD4BB -b 673B3444 -s 00000000'

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

-- Pinned window border
hl.window_rule({ match = { pin = true }, border_color = "rgba(FFB2BCAA) rgba(FFB2BC77)" })
