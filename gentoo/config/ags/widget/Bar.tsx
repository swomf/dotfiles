import { App } from "astal/gtk3"
import { Variable, GLib, bind, execAsync } from "astal"
import { Astal, Gtk, Gdk } from "astal/gtk3"
import Hyprland from "gi://AstalHyprland"
// import Mpris from "gi://AstalMpris"
import Battery from "gi://AstalBattery"
import Wp from "gi://AstalWp"
import Network from "gi://AstalNetwork"
import Tray from "gi://AstalTray"

function SysTray() {
  const tray = Tray.get_default()

  return <box className="tray">
    {bind(tray, "items").as(items => items.map(item => (
      <menubutton
        vexpand
        tooltipMarkup={bind(item, "tooltipMarkup")}
        usePopover={false}
        actionGroup={bind(item, "actionGroup").as(ag => ["dbusmenu", ag])}
        menuModel={bind(item, "menuModel")}>
        <icon gicon={bind(item, "gicon")} />
      </menubutton>
    )))}
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
  const revealer =
    <slider
      vertical
      inverted
      visible={false}
      min={0}
      max={1.5}
      heightRequest={50}
      onDragged={({ value }) => speaker.volume = value}
      value={bind(speaker, "volume")}
    />


  return <box vertical className="volume">
    {revealer}
    <button onClicked={() => {
      revealer.visible = !revealer.visible;
      //revealer.heightRequest = revealer.heightRequest == 50 ? 2 : 50;
      //revealer.set_reveal_child(!revealer.get_reveal_child());
      //console.log(revealer.revealChild, revealer.childRevealed, revealer.get_transition_duration(), revealer.get_transition_type(), revealer.get_child().visible)
    }}>
      <label
        yalign={0}
        angle={90}
        widthChars={5}
        label={bind(speaker, "volume").as(p => `${Math.floor(p * 100)} %`)} />
    </button>
    <button
      onClicked={() => {
        execAsync("pavucontrol");
      }}>
      <icon icon={bind(speaker, "volumeIcon")} />
    </button>
  </box >
}

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
      .filter(ws => ws.id > 0)
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
    name="bar"
    setup={self => App.add_window(self)}
    className="Bar"
    gdkmonitor={monitor}
    exclusivity={Astal.Exclusivity.EXCLUSIVE}
    layer={Astal.Layer.TOP}
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
