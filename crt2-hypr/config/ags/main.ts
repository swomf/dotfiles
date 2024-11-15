import Bar from "./components/bar"
import { NotificationPopups } from "./components/notify"

App.config({
  style: './style.css',
  windows: [
    Bar(0),
    NotificationPopups()
  ],
});
