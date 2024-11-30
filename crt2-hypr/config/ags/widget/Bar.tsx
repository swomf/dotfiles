import { App } from "astal/gtk3"
import { Variable, GLib, bind } from "astal"
import { Astal, Gtk, Gdk } from "astal/gtk3"
import Hyprland from "gi://AstalHyprland"
// import Mpris from "gi://AstalMpris"
import Battery from "gi://AstalBattery"
import Wp from "gi://AstalWp"
import Network from "gi://AstalNetwork"
import Tray from "gi://AstalTray"

function SysTray() {
  const tray = Tray.get_default()

  return <box vertical>
    {bind(tray, "items").as(items => items.map(item => {
      if (item.iconThemePath)
        App.add_icons(item.iconThemePath)

      const menu = item.create_menu()

      return <button
        tooltipMarkup={bind(item, "tooltipMarkup")}
        onDestroy={() => menu?.destroy()}
        onClickRelease={self => {
          menu?.popup_at_widget(self, Gdk.Gravity.SOUTH, Gdk.Gravity.NORTH, null)
        }}>
        <icon gIcon={bind(item, "gicon")} />
      </button>
    }))}
  </box>
}

function Wifi() {
  // TODO add network throughput
  const { wifi } = Network.get_default()

  return <icon
    tooltipText={bind(wifi, "ssid").as(String)}
    className="Wifi"
    icon={bind(wifi, "iconName")}
  />
}

function CPU() {
  const cpu = Variable(0).poll(
    2000,
    'cat /sys/class/thermal/thermal_zone0/temp',
    (stdout: string, prev: number) => 
      Math.round(Number(stdout) / 1000)
  )

  return <box className="CPU" vertical>
    <label angle={90} label={bind(cpu).as(p => `${p}°C`)} />
    <icon icon="cpu-symbolic" />
  </box>
}

function Memory() {
  const mem = Variable("0").poll(
    1000, 'free -h', (out: string, prev: string) => {
      const line: string = out.split('\n')
        .find(line => line.includes('Mem:'))!;
      const [total, free] = line.split(/\s+/).splice(1, 2);
      return `${free} / ${total}`;
    }
  )
  return <box className="Memory" vertical>
    <label angle={90} label={bind(mem).as(p => p)} />
    <icon icon="device_mem" />
  </box>
}

function Sound() {
  const speaker = Wp.get_default()?.audio.defaultSpeaker!

  return <box vertical>
    <label angle={90} label={bind(speaker, "volume").as(p => `${Math.floor(p * 100)} %`)} />
    <icon icon={bind(speaker, "volumeIcon")} />
  </box>
}
/*<slider
      vertical
      hexpand
      onDragged={({ value }) => speaker.volume = value}
      value={bind(speaker, "volume")}
    />
*/

function BatteryLevel() {
  const bat = Battery.get_default()

  return <box className="Battery"
    vertical
    visible={bind(bat, "isPresent")}>
    <label angle={90} label={bind(bat, "percentage").as(p =>
      `${Math.floor(p * 100)} %`
    )} />
    <icon icon={bind(bat, "batteryIconName")} />
  </box>
}

// function Media() {
//   const mpris = Mpris.get_default()

//   return <box className="Media">
//     {bind(mpris, "players").as(ps => ps[0] ? (
//       <box>
//         <box
//           className="Cover"
//           valign={Gtk.Align.CENTER}
//           css={bind(ps[0], "coverArt").as(cover =>
//             `background-image: url('${cover}');`
//           )}
//         />
//         <label
//           label={bind(ps[0], "title").as(() =>
//             `${ps[0].title} - ${ps[0].artist}`
//           )}
//         />
//       </box>
//     ) : (
//         "Nothing Playing"
//       ))}
//   </box>
// }

function Workspaces() {
  const hypr = Hyprland.get_default()

  return <box className="Workspaces" vertical>
    {bind(hypr, "workspaces").as(wss => wss
      .sort((a, b) => a.id - b.id)
      .map(ws => (
        <button
          className={bind(hypr, "focusedWorkspace").as(fw =>
            ws === fw ? "focused" : "")}
          onClicked={() => ws.focus()}>
          {ws.id}
        </button>
      ))
    )}
  </box>
}

function FocusedClient() {
  const hypr = Hyprland.get_default()
  const focused = bind(hypr, "focusedClient")

  return <box
    className="Focused"
    vertical
    visible={focused.as(Boolean)}>
    {focused.as(client => (
      client && <label label={bind(client, "title").as(String)} />
    ))}
  </box>
}

function Time({ format = "%Y-%m-%d %H:%M:%S %a" }) {
  const time = Variable<string>("").poll(1000, () =>
    GLib.DateTime.new_now_local().format(format)!)

  return <label
    angle={90}
    className="Time"
    onDestroy={() => time.drop()}
    label={time()}
  />
}

export default function Bar(monitor: Gdk.Monitor) {
  const { TOP, LEFT, BOTTOM } = Astal.WindowAnchor

  return <window
    className="Bar"
    gdkmonitor={monitor}
    exclusivity={Astal.Exclusivity.EXCLUSIVE}
    anchor={TOP | LEFT | BOTTOM}>
    <centerbox vertical>
      <box hexpand valign={Gtk.Align.START} vertical>
        <Workspaces />
      </box>
      <box />
      <box hexpand valign={Gtk.Align.END} vertical className="BarStuff">
        <SysTray />
        <Wifi />
        <CPU />
        <Memory />
        <BatteryLevel />
        <Sound />
        <Time />
      </box>
    </centerbox>
  </window>
}
