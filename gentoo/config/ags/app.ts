import app from "ags/gtk3/app"
import GLib from "gi://GLib?version=2.0"
import style from "./style.scss"
import Bar from "./widget/Bar"
import NotificationPopups from "./notifications/NotificationPopups"
import Runner, { openEmojiRunner, openRunner, openStdin, openSymbolRunner } from "./runner/Runner"

app.start({
  css: style,
  requestHandler(argv, response) {
    // https://aylur.github.io/ags/guide/app-cli.html#messaging-from-cli
    const [command, payload] = argv
    if (command === "runner") {
      if (payload === "emoji") openEmojiRunner()
      else if (payload === "unicode" || payload === "symbols") openSymbolRunner()
      else openRunner()
      response("ok")
    } else if (command === "runner-stdin" && payload) {
      try {
        const decoded = new TextDecoder().decode(GLib.base64_decode(payload))
        openStdin(decoded.split(/\r?\n/).filter(Boolean), response)
      } catch {
        response("")
      }
    } else {
      response(`unknown request: ${command ?? ""}`)
    }
  },
  main() {
    const monitors = app.get_monitors()
    monitors.map(Bar)
    monitors.map(NotificationPopups)
    Runner()
  },
})
