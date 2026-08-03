import app from "ags/gtk3/app"
import { Astal, Gdk } from "ags/gtk3"
import { createEffect, createState, For, onCleanup } from "ags"
import GLib from "gi://GLib?version=2.0"
import Notifd from "gi://AstalNotifd"
import Notification from "./Notification"
import { notificationCenterOpen } from "./NotificationCenter"

// org.freedesktop.Notifications: expire-timeout of -1 lets the server pick,
// 0 means the popup never expires on its own.
const DEFAULT_TIMEOUT = 5000

export default function NotificationPopups(gdkmonitor: Gdk.Monitor) {
  const { TOP, RIGHT } = Astal.WindowAnchor
  const notifd = Notifd.get_default()
  const [notifications, setNotifications] =
    createState<Array<Notifd.Notification>>([])
  const timers = new Map<number, number>()

  const clearTimer = (id: number) => {
    const source = timers.get(id)
    if (source !== undefined) {
      GLib.source_remove(source)
      timers.delete(id)
    }
  }

  // popups only hide, the notification stays in the center until dismissed
  const remove = (id: number) => {
    clearTimer(id)
    setNotifications(list => list.filter(notification => notification.id !== id))
  }

  const clearAll = () => {
    for (const id of [...timers.keys()]) clearTimer(id)
    setNotifications([])
  }

  const arm = (n: Notifd.Notification) => {
    clearTimer(n.id)
    if (n.urgency === Notifd.Urgency.CRITICAL) return
    const timeout = n.expireTimeout < 0 ? DEFAULT_TIMEOUT : n.expireTimeout
    if (timeout <= 0) return

    timers.set(n.id, GLib.timeout_add(GLib.PRIORITY_DEFAULT, timeout, () => {
      timers.delete(n.id)
      remove(n.id)
      return GLib.SOURCE_REMOVE
    }))
  }

  const notified = notifd.connect("notified", (_, id) => {
    if (notifd.dontDisturb || notificationCenterOpen.peek()) return

    const notification = notifd.get_notification(id)
    if (notification) {
      setNotifications(list => [
        notification,
        ...list.filter(item => item.id !== id),
      ])
      arm(notification)
    }
  })

  const resolved = notifd.connect("resolved", (_, id) => remove(id))
  const dontDisturb = notifd.connect("notify::dont-disturb", () => {
    if (notifd.dontDisturb) clearAll()
  })

  createEffect(() => {
    if (notificationCenterOpen()) clearAll()
  })

  onCleanup(() => {
    clearAll()
    notifd.disconnect(notified)
    notifd.disconnect(resolved)
    notifd.disconnect(dontDisturb)
  })

  return <window
    application={app}
    class="notification-popups"
    gdkmonitor={gdkmonitor}
    exclusivity={Astal.Exclusivity.EXCLUSIVE}
    anchor={TOP | RIGHT}>
    <box vertical>
      <For each={notifications}>
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
