import { Binding } from "types/service";

const hyprland = await Service.import("hyprland")
const audio = await Service.import("audio")
const battery = await Service.import("battery")
const systemtray = await Service.import("systemtray")

function StandardLabel(label: string | Binding<any, any, string> | null | undefined, class_name: string) {
  return Widget.Label({
    angle: 90,
    vpack: "end",
    hpack: "center",
    useMarkup: true,
    label: label,
    class_name: class_name,
    css: "font-size: 12px; font-family: 'Nimbus Sans'; font-weight: normal; margin: 3px;",
  });
}

function Workspaces() {
  const activeId = hyprland.active.workspace.bind("id")
  // sort workspaces
  const workspaces = Array.from({ length: 20 }, (_, ws) => ws + 1).map(
    ws => Widget.Button({
      attribute: ws,
      label: `${ws}`, //      modulus into 1<=20 for grid-like system
      css: "min-width: 20px; padding: 0px; margin: 0px;",
      class_name: activeId.as(i => `${(i-1) % 20 + 1 === ws ? "focused" : ""}`),
      onClicked: () => hyprland.messageAsync(`dispatch workspace ${ws}`)
    })
  )

  return Widget.Box({
    class_name: "workspaces",
    vertical: true,
    children: workspaces,
    setup: self => self.hook(hyprland, () => self.children.forEach(btn => {
      btn.visible = hyprland.workspaces.some(ws => ws.id === btn.attribute);
    })),
  })
}

function Top() {
  return Widget.Box({
    spacing: 8,
    children: [
      Workspaces(),
    ],
  })
}

function SysTray() {
  const items = systemtray.bind("items")
    .as(items => items.map(item => Widget.Button({
      child: Widget.Icon({
        icon: item.bind("icon"),
        size: 10,
        css: "padding: 0px; margin: 0px;",
      }),
      on_primary_click: (_, event) => item.activate(event),
      on_secondary_click: (_, event) => item.openMenu(event),
      tooltip_markup: item.bind("tooltip_markup"),
    })))

  return Widget.Box({
    vertical: true,
    children: items,
  })
}

function CoreTempLabel() {
  const cpu = Variable(0, {
    poll: [
      2000,
      'cat /sys/class/thermal/thermal_zone0/temp',
      // @ts-ignore
      out => `${Math.round(Number(out) / 1000)}°C`
    ]
  });

  return Widget.Box({
    vertical: true,
    children: [
      StandardLabel(cpu.bind().as(c => `${c}`), "cpu"),
      Widget.Icon({
        icon: "cpu-symbolic",
      })
    ]
  })
}

// function cpuProgress() {
//   const cpu = Variable(0, {
//     poll: [2000, 'top -b -n 1', out => divide([100, out.split('\n')
//       .find(line => line.includes('Cpu(s)'))
//       .split(/\s+/)[1]
//       .replace(',', '.')])],
//   });

//   return Widget.Label({
//     angle: 90,
//     vpack: "end",
//     hpack: "center",
//     useMarkup: true,
//     label: cpu.bind().as(c => `${Math.floor(c * 100) / 100}%`),
//     class_name: "cpu",
//   })
// }

// function ramProgress() {
//   const ram = Variable(0, {
//     poll: [2000, 'free', out => {
//       const line = out.split('\n') || ""
//         .find(line => line.includes('Mem:'));
//       const [total, free] = line.split(/\s+/).splice(1, 2).map(x => parseInt(x.replace(/[^\d]/g, ''), 10));
//       return divide([total, free]);
//     }],
//   });
//   Widget.Label({
//     label: ram.bind().as(r => `${Math.floor(r * 100) / 100}%`),
//   })
// }

function BatteryLabel() {
  return Widget.Box({
    vertical: true,
    children: [
      StandardLabel(battery.bind("percent").as(p => `${p}%`), "battery"),
      Widget.Icon({
        icon: Utils.merge([battery.bind("percent"), battery.bind("charging")], (percent, isCharging) => {
          return `battery-${Math.floor(percent / 10).toString().padStart(2, '0')}0${isCharging ? "-charging" : ""}`
        })
        // icon: battery.bind("percent").as(p =>
        //   `battery-${Math.floor(p / 10).toString().padStart(2, '0')}0${battery.charging ? "-charging" : ""}`),
      })
    ]
  })
}
//   return Widget.Label({
//     angle: 90,
//     vpack: "end",
//     hpack: "center",
//     useMarkup: true,
//     label: battery.bind("percent").as(p =>
//       " <span face='Nimbus Sans' font-weight='normal'>"
//       + p
//       + "</span> "),
//     class_name: "battery",
//     css: "font-size: 11px;",
//   })
// }

// function BatteryIcon() {
//   return Widget.Icon({
//     icon: battery.bind("percent").as(p =>
//       `battery-level-${Math.floor(p / 10) * 10}-symbolic`),
//   })
// }

function RAMLabel() {
  const ram = Variable("", {
    poll: [2000, 'free -h', out => {
      // @ts-ignore
      const line: string = out.split('\n')
        .find(line => line.includes('Mem:'));
      const [total, free] = line.split(/\s+/).splice(1, 2);
      return `${free} / ${total}`;
    }],
  });
  return Widget.Box({
    vertical: true,
    children: [
      StandardLabel(ram.bind(), "ram"),
      Widget.Icon({
        icon: 'device_mem'
      }),
    ]
  })
}

function Volume() {
  const icons = {
    101: "overamplified",
    67: "high",
    34: "medium",
    1: "low",
    0: "muted",
  }

  function getIcon() {
    const icon = audio.speaker.is_muted ? 0 : [101, 67, 34, 1, 0].find(
      threshold => threshold <= audio.speaker.volume * 100)

    return `audio-volume-${icons[icon || 0]}-symbolic`
  }

  const icon = Widget.Icon({
    icon: Utils.watch(getIcon(), audio.speaker, getIcon),
    size: 13,
  })

  // const volumeEntry = Widget.Entry({
  //   placeholder_text: "t",
  //   text: `${audio.speaker.volume * 100}`,
  //   onAccept: ({text}) => {
  //     if (Number(text) > 0 && Number(text) <= 100) {
  //       audio.speaker.volume = Number(text) / 100        
  //     }
  //   }
  // })

  // const slider = Widget.Slider({
  //   orientation: 1,
  //   vexpand: true,
  //   value: 0,
  //   min: 0,
  //   max: 1,
  //   draw_value: false,
  //   on_change: ({ value }) => audio.speaker.volume = value,
  //   setup: self => self.hook(audio.speaker, () => {
  //     self.value = audio.speaker.volume || 0
  //   }),
  // })

  return Widget.Box({
    vertical: true,
    class_name: "volume",
    css: "min-width: 1px",
    hpack: "center",
    children: [
      // StandardLabel(audio.bind("speaker").as(s => `${(s.volume * 100).toFixed(0)}%`), "volume"),
      icon,
    ],
    // children: [icon, slider],
  })
}

const time = Variable("", {
  poll: [1000, 'date "+%Y-%m-%d %H:%M:%S %a"'],
})

function Clock() {
  return Widget.Box({
    vpack: "end",
    hpack: "center",
    child: StandardLabel(time.bind(), "time"),
    // class_name: activeId.as(i => `${i === ws ? "focused" : ""}`),
    //onClicked: () => {
    //  App.ToggleWindow("calendar")
    //}/* todo add calendar */,
    css: "font-size: 11px; font-family: 'Nimbus Sans'; font-weight: normal;",
  })
}


function Bottom() {
  return Widget.Box({
    // hpack: "center",
    vpack: "end",
    spacing: 4,
    vertical: true,
    children: [
      SysTray(),
      CoreTempLabel(),
      BatteryLabel(),
      RAMLabel(),
      Volume(),
      Clock(),
    ],
  })
}

export default function Bar(monitor: number) {
  return Widget.Window({
    monitor,
    name: `bar${monitor}`,
    anchor: ['top', 'left', 'bottom'],
    exclusivity: 'exclusive',
    child: Widget.CenterBox({
      vertical: true,
      start_widget: Top(),
      end_widget: Bottom(),
    })
  })
};

/*
function ClientTitle() {
  return Widget.Label({
    class_name: "client-title",
    label: hyprland.active.client.bind("title"),
  })
}


function Clock() {
  return Widget.Label({
    class_name: "clock",
    label: date.bind(),
  })
}


// we don't need dunst or any other notification daemon
// because the Notifications module is a notification daemon itself
function Notification() {
  const popups = notifications.bind("popups")
  return Widget.Box({
    class_name: "notification",
    visible: popups.as(p => p.length > 0),
    children: [
      Widget.Icon({
        icon: "preferences-system-notifications-symbolic",
      }),
      Widget.Label({
        label: popups.as(p => p[0]?.summary || ""),
      }),
    ],
  })
}


function Media() {
  const label = Utils.watch("", mpris, "player-changed", () => {
    if (mpris.players[0]) {
      const { track_artists, track_title } = mpris.players[0]
      return `${track_artists.join(", ")} - ${track_title}`
    } else {
      return "Nothing is playing"
    }
  })

  return Widget.Button({
    class_name: "media",
    on_primary_click: () => mpris.getPlayer("")?.playPause(),
    on_scroll_up: () => mpris.getPlayer("")?.next(),
    on_scroll_down: () => mpris.getPlayer("")?.previous(),
    child: Widget.Label({ label }),
  })
}


function Volume() {
  const icons = {
    101: "overamplified",
    67: "high",
    34: "medium",
    1: "low",
    0: "muted",
  }

  function getIcon() {
    const icon = audio.speaker.is_muted ? 0 : [101, 67, 34, 1, 0].find(
      threshold => threshold <= audio.speaker.volume * 100)

    return `audio-volume-${icons[icon]}-symbolic`
  }

  const icon = Widget.Icon({
    icon: Utils.watch(getIcon(), audio.speaker, getIcon),
  })

  const slider = Widget.Slider({
    hexpand: true,
    draw_value: false,
    on_change: ({ value }) => audio.speaker.volume = value,
    setup: self => self.hook(audio.speaker, () => {
      self.value = audio.speaker.volume || 0
    }),
  })

  return Widget.Box({
    class_name: "volume",
    css: "min-width: 180px",
    children: [icon, slider],
  })
}


function BatteryLabel() {
  const value = battery.bind("percent").as(p => p > 0 ? p / 100 : 0)
  const icon = battery.bind("percent").as(p =>
    `battery-level-${Math.floor(p / 10) * 10}-symbolic`)

  return Widget.Box({
    class_name: "battery",
    visible: battery.bind("available"),
    children: [
      Widget.Icon({ icon }),
      Widget.LevelBar({
        widthRequest: 140,
        vpack: "center",
        value,
      }),
    ],
  })
}


function SysTray() {
  const items = systemtray.bind("items")
    .as(items => items.map(item => Widget.Button({
      child: Widget.Icon({ icon: item.bind("icon") }),
      on_primary_click: (_, event) => item.activate(event),
      on_secondary_click: (_, event) => item.openMenu(event),
      tooltip_markup: item.bind("tooltip_markup"),
    })))

  return Widget.Box({
    children: items,
  })
}


// layout of the bar
function Left() {
  return Widget.Box({
    spacing: 8,
    children: [
      Workspaces(),
      ClientTitle(),
    ],
  })
}

function Center() {
  return Widget.Box({
    spacing: 8,
    children: [
      Media(),
      Notification(),
    ],
  })
}

function Right() {
  return Widget.Box({
    hpack: "end",
    spacing: 8,
    children: [
      Volume(),
      BatteryLabel(),
      Clock(),
      SysTray(),
    ],
  })
}

function Bar(monitor = 0) {
  return Widget.Window({
    name: `bar-${monitor}`, // name has to be unique
    class_name: "bar",
    monitor,
    anchor: ["top", "left", "right"],
    exclusivity: "exclusive",
    child: Widget.CenterBox({
      start_widget: Left(),
      center_widget: Center(),
      end_widget: Right(),
    }),
  })
}

*/
