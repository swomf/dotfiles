import GLib from "gi://GLib?version=2.0"
import Notifd from "gi://AstalNotifd"

// TODO: maybe refactor since timeout timers do the same stuff a lot
const timers = new Map<number, number>()

function cancelExpiry(id: number) {
  const timerID = timers.get(id)
  if (timerID !== undefined) {
    GLib.source_remove(timerID)
    timers.delete(id)
  }
}

// notif already active means the notification was already stored there during startup
function scheduleExpiry(notification: Notifd.Notification, notifAlreadyActive = false) {
  cancelExpiry(notification.id)
  // https://specifications.freedesktop.org/notification/latest/hints.html
  // https://specifications.freedesktop.org/notification/latest/protocol.html
  // https://specifications.freedesktop.org/notification/latest/urgency-levels.html
  if (!notification.transient ||
    notification.urgency === Notifd.Urgency.CRITICAL ||
    notification.expireTimeout === 0) return

  const timeoutMs = notification.expireTimeout < 0
    ? 5000 : notification.expireTimeout
  const elapsedMs = notifAlreadyActive ? Math.max(0, Date.now() - notification.time * 1000) : 0
  timers.set(notification.id, GLib.timeout_add(
    GLib.PRIORITY_DEFAULT, Math.max(1, timeoutMs - elapsedMs), () => {
      timers.delete(notification.id)
      Notifd.get_default().get_notification(notification.id)?.expire()
      return GLib.SOURCE_REMOVE
    }))
}

export function configureNotificationPersistence() {
  const notifd = Notifd.get_default()
  notifd.ignoreTimeout = true
  const notified = notifd.connect("notified", (_, id) => {
    const notification = notifd.get_notification(id)
    if (notification) scheduleExpiry(notification)
  })
  const resolved = notifd.connect("resolved", (_, id) => cancelExpiry(id))
  for (const notification of notifd.get_notifications()) scheduleExpiry(notification, true)

  return () => {
    notifd.disconnect(notified)
    notifd.disconnect(resolved)
    for (const id of timers.keys()) cancelExpiry(id)
  }
}
