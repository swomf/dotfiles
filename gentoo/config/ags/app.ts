import app from "ags/gtk3/app"
import Gio from "gi://Gio?version=2.0"
import GLib from "gi://GLib?version=2.0"
import Notifd from "gi://AstalNotifd"
import style from "./style.scss"
import Bar from "./widget/Bar"
import NotificationPopups from "./notifications/NotificationPopups"
import NotificationCenter, { showCenter } from "./notifications/NotificationCenter"
import Runner, { openRunner } from "./runner/Runner"

app.start({
  css: style,
  requestHandler(argv, response) {
    // https://aylur.github.io/ags/guide/app-cli.html#messaging-from-cli
    const [command, arg] = argv
    if (command === "runner") {
      if (arg === "unicode" || arg === "symbols") openRunner("symbols")
      else openRunner(arg === "emoji" || arg === "rink" ? arg : null)
      response("ok")
    } else if (command === "runner-stdin" && arg) {
      try {
        const decoded = new TextDecoder().decode(GLib.base64_decode(arg))
        openRunner({ lines: decoded.split(/\r?\n/).filter(Boolean), respond: response })
      } catch {
        response("")
      }
    } else if (command === "notifications") {
      if (arg === "dnd") {
        const notifd = Notifd.get_default()
        notifd.dontDisturb = !notifd.dontDisturb
        response(notifd.dontDisturb ? "dnd on" : "dnd off")
        return
      }
      if (arg === "open") showCenter(true)
      else if (arg === "close") showCenter(false)
      else showCenter()
      response("ok")
    } else {
      response(`unknown request: ${command ?? ""}`)
    }
  },
  main() {
    // https://specifications.freedesktop.org/notification/latest/protocol.html#command-get-capabilities
    const settings = Gio.Settings.new("io.astal.notifd")
    const key = "server-capabilites"
    const caps = settings.get_strv(key)
    const supported = caps.filter(cap => cap !== "body-images" && cap !== "sound")
    if (supported.length !== caps.length) settings.set_strv(key, supported)

    Notifd.get_default().ignoreTimeout = true // popups expire separately from history
    const monitors = app.get_monitors()
    monitors.map(Bar)
    monitors.map(NotificationPopups)
    NotificationCenter()
    Runner()
  },
})
