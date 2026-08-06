import app from "ags/gtk3/app"
import GLib from "gi://GLib?version=2.0"
import Notifd from "gi://AstalNotifd"
import style from "./style.scss"
import Bar from "./widget/Bar"
import NotificationPopups from "./notifications/NotificationPopups"
import { configureNotificationCapabilities } from "./notifications/capabilities"
import { initNotificationSounds } from "./notifications/sound"
import NotificationCenter, {
  closeNotificationCenter,
  configureNotificationPersistence,
  openNotificationCenter,
  toggleNotificationCenter,
} from "./notifications/NotificationCenter"
import Runner, { openEmojiRunner, openRinkRunner, openRunner, openStdin, openSymbolRunner } from "./runner/Runner"

app.start({
  css: style,
  requestHandler(argv, response) {
    // https://aylur.github.io/ags/guide/app-cli.html#messaging-from-cli
    const [command, payload] = argv
    if (command === "runner") {
      if (payload === "emoji") openEmojiRunner()
      else if (payload === "unicode" || payload === "symbols") openSymbolRunner()
      else if (payload === "rink") openRinkRunner()
      else openRunner()
      response("ok")
    } else if (command === "runner-stdin" && payload) {
      try {
        const decoded = new TextDecoder().decode(GLib.base64_decode(payload))
        openStdin(decoded.split(/\r?\n/).filter(Boolean), response)
      } catch {
        response("")
      }
    } else if (command === "notifications") {
      if (payload === "open") openNotificationCenter()
      else if (payload === "close") closeNotificationCenter()
      else if (payload === "dnd") {
        const notifd = Notifd.get_default()
        notifd.dontDisturb = !notifd.dontDisturb
        response(notifd.dontDisturb ? "dnd on" : "dnd off")
        return
      } else toggleNotificationCenter()
      response("ok")
    } else {
      response(`unknown request: ${command ?? ""}`)
    }
  },
  main() {
    configureNotificationCapabilities()
    configureNotificationPersistence()
    initNotificationSounds()
    const monitors = app.get_monitors()
    monitors.map(Bar)
    monitors.map(NotificationPopups)
    NotificationCenter()
    Runner()
  },
})
