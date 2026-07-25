import app from "ags/gtk3/app"
import { Astal, Gdk } from "ags/gtk3"
import { createBinding, createEffect, createState, For, With } from "ags"
import { createPoll } from "ags/time"
import GLib from "gi://GLib?version=2.0"
import Hyprland from "gi://AstalHyprland"
// import Mpris from "gi://AstalMpris"
import Battery from "gi://AstalBattery"
import Wp from "gi://AstalWp"
import Network from "gi://AstalNetwork"
import Tray from "gi://AstalTray"

function SysTray() {
  const tray = Tray.get_default()
  const items = createBinding(tray, "items")

  return <box class="tray" vertical>
    <For each={items}>
      {item => {
        const actionGroup = createBinding(item, "actionGroup")

        return (
          <menubutton
            vexpand
            hexpand
            tooltipMarkup={createBinding(item, "tooltipMarkup")}
            usePopover={false}
            menuModel={createBinding(item, "menuModel")}
            $={self => createEffect(() =>
              self.insert_action_group("dbusmenu", actionGroup()))}>
            <icon gicon={createBinding(item, "gicon")} />
          </menubutton>
        )
      }}
    </For>
  </box>
}

function Wifi() {
  const wifi = Network.get_default().get_wifi()!

  return (
    <icon
      tooltipText={createBinding(wifi, "ssid").as(String)}
      class="Wifi"
      icon={createBinding(wifi, "iconName")}
    />
  )
}

function CPU() {
  const cpuTemp = createPoll(
    0,
    2000,
    'cat /sys/class/thermal/thermal_zone0/temp',
    (stdout: string) =>
      Math.round(Number(stdout) / 1000)
  )
  // TODO: reorganize magic constant (this css color) into different file
  const dangerousTemp = cpuTemp.as(p => p >= 90 ? 'color: #FF7F7F' : '')

  return <box class="CPU" vertical>
    <label angle={90} label={cpuTemp.as(p => `${p}°C`)} css={dangerousTemp} />
    <icon icon="cpu-symbolic" css={dangerousTemp} />
  </box>
}

function Memory() {
  const mem = createPoll(
    "0",
    1000,
    'free -h',
    (out: string) => {
      const line: string = out.split('\n')
        .find(line => line.includes('Mem:'))!
      const [total, free] = line.split(/\s+/).splice(1, 2)
      return `${free} / ${total}`
    }
  )
  return <box class="Memory" vertical>
    <label angle={90} label={mem} />
    <icon icon="device_mem" />
  </box>
}

function Sound() {
  const speaker = Wp.get_default()!.audio.defaultSpeaker
  const [sliderVisible, setSliderVisible] = createState(false)
  const volume = createBinding(speaker, "volume")
  const volumeIcon = createBinding(speaker, "volumeIcon")

  // TODO: - flip color of volume icon when button pressed,
  //         iff initially white
  //       - add right click menu (upstream docs incorrect)
  //         to execAsync easyeffects and pavucontrol
  return <box vertical class="volume">
    <slider
      vertical
      inverted
      visible={sliderVisible}
      min={0}
      max={1.5}
      heightRequest={50}
      onDragged={({ value }) => speaker.volume = value}
      value={volume}
    />
    <button onClicked={() => setSliderVisible(visible => !visible)}>
      <box vertical>
        <label
          yalign={0}
          angle={90}
          widthChars={5}
          label={volume.as(value => `${Math.floor(value * 100)} %`)} />
        <icon icon={volumeIcon} />
      </box>
    </button>
  </box >
}

function BatteryLevel() {
  const bat = Battery.get_default()

  return <box class="Battery"
    vertical
    visible={createBinding(bat, "isPresent")}>
    <label angle={90} label={createBinding(bat, "percentage").as(p =>
      `${Math.floor(p * 100)} %`
    )} />
    <icon icon={createBinding(bat, "batteryIconName")} />
  </box>
}

function Workspaces() {
  const hypr = Hyprland.get_default()
  const workspaces = createBinding(hypr, "workspaces").as(wss => wss
    .toSorted((a, b) => a.id - b.id)
    .filter(ws => ws.id > 0))
  const focusedWorkspace = createBinding(hypr, "focusedWorkspace")

  return <box class="Workspaces" vertical>
    <For each={workspaces}>
      {ws => (
        <button
          class={focusedWorkspace.as(fw => ws === fw ? "focused" : "")}
          onClicked={() => ws.focus()}>
          {ws.id}
        </button>
      )}
    </For>
  </box>
}

function FocusedClient() {
  const hypr = Hyprland.get_default()
  const focused = createBinding(hypr, "focusedClient")

  return <box
    class="Focused"
    vertical
    visible={focused.as(Boolean)}>
    <With value={focused}>
      {client => client && <label label={createBinding(client, "title").as(String)} />}
    </With>
  </box>
}

function Time({ format = "%Y-%m-%d %H:%M:%S %a" }) {
  const time = createPoll("", 1000, () =>
    GLib.DateTime.new_now_local().format(format)!)

  return <label
    angle={90}
    class="Time"
    label={time}
  />
}

export default function Bar(monitor: Gdk.Monitor) {
  const { TOP, LEFT, BOTTOM } = Astal.WindowAnchor

  return <window
    name="bar"
    application={app}
    class="Bar"
    gdkmonitor={monitor}
    exclusivity={Astal.Exclusivity.EXCLUSIVE}
    layer={Astal.Layer.TOP}
    anchor={TOP | LEFT | BOTTOM}>
    <box vertical>
      <box hexpand vertical>
        <Workspaces />
      </box>
      <box vexpand />
      <box hexpand vertical class="BarStuff">
        <SysTray />
        <Wifi />
        <CPU />
        <Memory />
        <BatteryLevel />
        <Sound />
        <Time />
      </box>
    </box>
  </window>
}
