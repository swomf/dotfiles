const notifications = await Service.import("notifications")
import { Notification as NotificationInterface } from "types/service/notifications"

function NotificationIcon({ app_entry, app_icon, image }: NotificationInterface) {
  if (image) {
    return Widget.Box({
      css: `background-image: url("${image}");`
        + "background-size: contain;"
        + "background-repeat: no-repeat;"
        + "background-position: center;",
    })
  }

  let icon = "dialog-information-symbolic"
  if (Utils.lookUpIcon(app_icon))
    icon = app_icon

  if (app_entry && Utils.lookUpIcon(app_entry))
    icon = app_entry

  return Widget.Box({
    child: Widget.Icon(icon),
  })
}

function Notification(n: NotificationInterface) {
  const icon = Widget.Box({
    // vpack: "start",
    class_name: "icon",
    child: NotificationIcon(n),
  })

  const title = Widget.Label({
    class_name: "title",
    xalign: 0,
    justification: "left",
    hexpand: true,
    max_width_chars: 24,
    truncate: "end",
    wrap: true,
    label: n.summary,
    use_markup: true,
  })

  const body = Widget.Label({
    class_name: "body",
    hexpand: true,
    use_markup: true,
    xalign: 0,
    justification: "left",
    label: n.body,
    wrap: true,
  })

  const actions = Widget.Box({
    class_name: "actions",
    children: n.actions.map(({ id, label }) => Widget.Button({
      class_name: "action-button",
      on_clicked: () => {
        n.invoke(id)
        n.dismiss()
      },
      hexpand: true,
      child: Widget.Label(label),
    })),
  })

  return Widget.EventBox(
    {
      attribute: { id: n.id },
      on_primary_click: n.dismiss,
    },
    Widget.Box(
      {
        class_name: `notification ${n.urgency}`,
        vertical: true,
      },
      Widget.Box([
        icon,
        Widget.Box(
          { vertical: true },
          title,
          body,
        ),
      ]),
      actions,
    ),
  )
}

export function NotificationPopups(monitor = 0) {
  const list = Widget.Box({
    vertical: true,
    children: notifications.popups.map(Notification),
  })

  // the type of _ is supposedly an AgsWidget but
  // it is not well-defined. Hence, any is used
  function onNotified(_: any, id: number) {
    const n = notifications.getNotification(id)
    if (n)
      list.children = [Notification(n), ...list.children]
  }

  function onDismissed(_:any, id: number) {
    list.children.find(n => n.attribute.id === id)?.destroy()
  }

  list.hook(notifications, onNotified, "notified")
    .hook(notifications, onDismissed, "dismissed")

  return Widget.Window({
    monitor,
    name: `notifications${monitor}`,
    class_name: "notification-popups",
    layer: "overlay",
    anchor: ["top", "right"],
    child: Widget.Box({
      css: "min-width: 2px; min-height: 2px;",
      class_name: "notifications",
      vertical: true,
      child: list,

      /** this is a simple one liner that could be used instead of
        hooking into the 'notified' and 'dismissed' signals.
        but its not very optimized becuase it will recreate
        the whole list everytime a notification is added or dismissed */
      // children: notifications.bind('popups')
      //   .as(popups => popups.map(Notification))
    }),
  })
}
