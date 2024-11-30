import { App } from "astal/gtk3"
import style from "./style.scss"
import Bar from "./widget/Bar"
import NotificationPopups from "./notifications/NotificationPopups"

App.start({
  css: style,
  main: () => {
    const monitors = App.get_monitors();
    monitors.map(Bar);
    monitors.map(NotificationPopups);
  }
})
