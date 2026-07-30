import app from "ags/gtk3/app"
import { Astal, Gdk } from "ags/gtk3"
import { createState, For, onCleanup } from "ags"
import Notifd from "gi://AstalNotifd"
import Notification from "./Notification"

export default function NotificationPopups(gdkmonitor: Gdk.Monitor) {
  const { TOP, RIGHT } = Astal.WindowAnchor
  const notifd = Notifd.get_default()
  const [notifications, setNotifications] =
    createState<Array<Notifd.Notification>>([])
  const remove = (id: number) =>
    setNotifications(list => list.filter(notification => notification.id !== id))

  const notified = notifd.connect("notified", (_, id) => {
    const notification = notifd.get_notification(id)
    if (notification) {
      setNotifications(list => [
        notification,
        ...list.filter(item => item.id !== id),
      ])
    }
  })

  const resolved = notifd.connect("resolved", (_, id) => remove(id))

  onCleanup(() => {
    notifd.disconnect(notified)
    notifd.disconnect(resolved)
  })

  return <window
    application={app}
    class="notification-popups"
    gdkmonitor={gdkmonitor}
    exclusivity={Astal.Exclusivity.EXCLUSIVE}
    anchor={TOP | RIGHT}>
    <box vertical>
      <For each={notifications} id={notification => notification.id}>
        {notification => (
          <Notification
            notification={notification}
            onHoverLost={() => remove(notification.id)}
          />
        )}
      </For>
    </box>
  </window>
}
