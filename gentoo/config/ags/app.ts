import app from "ags/gtk3/app"
import style from "./style.scss"
import Bar from "./widget/Bar"
import NotificationPopups from "./notifications/NotificationPopups"

app.start({
  css: style,
  main() {
    const monitors = app.get_monitors()
    monitors.map(Bar)
    monitors.map(NotificationPopups)
  },
})
