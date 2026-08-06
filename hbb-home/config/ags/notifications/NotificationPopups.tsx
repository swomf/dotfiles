import app from "ags/gtk3/app"
import { Astal, Gdk } from "ags/gtk3"
import { createEffect, createState, For, onCleanup } from "ags"
import GLib from "gi://GLib?version=2.0"
import Notifd from "gi://AstalNotifd"
import Notification from "./Notification"
import { centerOpen } from "./NotificationCenter"

// https://specifications.freedesktop.org/notification/latest/protocol.html
const DEFAULT_TIMEOUT = 5000
const EVOLUTION_TIMEOUT = 60_000

const popupTimeout = (n: Notifd.Notification) => {
  const sender = `${n.appName} ${n.desktopEntry}`.toLowerCase()

  if (sender.includes("evolution") ||
      sender.includes("events and tasks reminders"))
    return EVOLUTION_TIMEOUT

  return n.expireTimeout < 0 ? DEFAULT_TIMEOUT : n.expireTimeout
}

export default function NotificationPopups(gdkmonitor: Gdk.Monitor) {
  const { TOP, RIGHT } = Astal.WindowAnchor
  const notifd = Notifd.get_default()
  const [notifications, setNotifications] =
    createState<Array<Notifd.Notification>>([])
  const timers = new Map<number, number>()

  const clearTimer = (id: number) => {
    const timerID = timers.get(id)
    if (timerID !== undefined) {
      GLib.source_remove(timerID)
      timers.delete(id)
    }
  }

  const remove = (id: number) => {
    clearTimer(id)
    setNotifications(list => list.filter(notification => notification.id !== id))
  }

  const clearAll = () => {
    for (const timerID of timers.values()) GLib.source_remove(timerID)
    timers.clear()
    setNotifications([])
  }

  // so that a week of not checking doesnt turn into 800 msgs, which would cause lag
  const scheduleNotificationExpiring = (notif: Notifd.Notification) => {
    clearTimer(notif.id)
    // https://specifications.freedesktop.org/notification/latest/urgency-levels.html
    if (notif.urgency === Notifd.Urgency.CRITICAL) return
    const timeout = popupTimeout(notif)
    if (timeout <= 0) return

    timers.set(notif.id, GLib.timeout_add(GLib.PRIORITY_DEFAULT, timeout, () => {
      timers.delete(notif.id)
      remove(notif.id)
      return GLib.SOURCE_REMOVE
    }))
  }

  const notified = notifd.connect("notified", (_, id) => {
    if (notifd.dontDisturb || centerOpen.peek()) return

    const notification = notifd.get_notification(id)
    if (notification) {
      setNotifications(list => [
        notification,
        ...list.filter(item => item.id !== id),
      ])
      scheduleNotificationExpiring(notification)
    }
  })

  const resolved = notifd.connect("resolved", (_, id) => remove(id))
  const dontDisturb = notifd.connect("notify::dont-disturb", () => {
    if (notifd.dontDisturb) clearAll()
  })

  createEffect(() => {
    if (centerOpen()) clearAll()
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
