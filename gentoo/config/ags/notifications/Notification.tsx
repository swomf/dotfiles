import { Gtk, Astal } from "ags/gtk3"
import Gio from "gi://Gio?version=2.0"
import GLib from "gi://GLib?version=2.0"
import Notifd from "gi://AstalNotifd"

const isIcon = (icon: string) =>
  !!Astal.Icon.lookup_icon(icon)

const imageFile = (image: string) => {
  if (!image) return null

  try {
    const file = image.startsWith("file://")
      ? Gio.File.new_for_uri(image)
      : Gio.File.new_for_path(image)

    return file.query_exists(null) ? file : null
  } catch {
    return null
  }
}

const cssUrl = (file: Gio.File) =>
  file.get_uri().replaceAll("\\", "\\\\").replaceAll("'", "\\'")

const categoryIcon = (category: string) => {
  const icons: Record<string, string> = {
    "call.incoming": "call-start-symbolic",
    "call": "call-start-symbolic",
    "device.error": "dialog-error-symbolic",
    "device": "drive-removable-media-symbolic",
    "email": "mail-unread-symbolic",
    "im": "mail-unread-symbolic",
    "network.error": "network-error-symbolic",
    "network": "network-transmit-receive-symbolic",
    "presence.online": "user-available-symbolic",
    "presence.offline": "user-offline-symbolic",
    "transfer.complete": "emblem-ok-symbolic",
    "transfer.error": "dialog-error-symbolic",
    "transfer": "folder-download-symbolic",
  }

  const specific = icons[category]
  const generic = icons[category.split(".")[0]]
  return [specific, generic].find(icon => icon && isIcon(icon)) || null
}

const categoryClass = (category: string) => category
  ? ` category-${category.replace(/[^a-zA-Z0-9_-]/g, "-")}`
  : ""

const time = (time: number, format = "%H:%M") => GLib.DateTime
  .new_from_unix_local(time)
  .format(format)!

const urgency = (n: Notifd.Notification) => {
  const { LOW, NORMAL, CRITICAL } = Notifd.Urgency
  // match operator when?
  switch (n.urgency) {
    case LOW: return "low"
    case CRITICAL: return "critical"
    case NORMAL:
    default: return "normal"
  }
}

type Props = {
  onHoverLost(self: Astal.EventBox): void
  notification: Notifd.Notification
}

export default function Notification(props: Props) {
  const { notification: n, onHoverLost } = props
  const { START, CENTER, END } = Gtk.Align
  const actions = n.get_actions()
  const defaultAction = actions.find(({ id }) => id === "default")
  const visibleActions = actions.filter(({ id }) => id !== "default")
  const file = imageFile(n.image)
  const fallbackImage = !n.image ? categoryIcon(n.category) : null

  return <eventbox
    class={`notification ${urgency(n)}${categoryClass(n.category)}`}
    onClick={(_, event) => {
      if (event.button === Astal.MouseButton.PRIMARY && defaultAction)
        n.invoke(defaultAction.id)
    }}
    onHoverLost={onHoverLost}>
    <box vertical>
      <box class="header">
        {(n.appIcon || n.desktopEntry) && <icon
          class="app-icon"
          visible={Boolean(n.appIcon || n.desktopEntry)}
          icon={n.appIcon || n.desktopEntry}
        />}
        <label
          class="app-name"
          halign={START}
          truncate
          label={n.appName || "Unknown"}
        />
        <label
          class="time"
          hexpand
          halign={END}
          label={time(n.time)}
        />
        <button onClicked={() => n.dismiss()}>
          <icon icon="window-close-symbolic" />
        </button>
      </box>
      <Gtk.Separator visible />
      <box class="content">
        {file && <box
          valign={START}
          class="image"
          css={`background-image: url('${cssUrl(file)}')`}
        />}
        {n.image && !file && isIcon(n.image) && <box
          expand={false}
          valign={CENTER}
          class="icon-image">
          <icon icon={n.image} halign={CENTER} valign={CENTER} />
        </box>}
        {fallbackImage && <box
          expand={false}
          valign={CENTER}
          class="icon-image category-image">
          <icon icon={fallbackImage} halign={CENTER} valign={CENTER} />
        </box>}
        <box vertical hexpand>
          <label
            class="summary"
            halign={START}
            xalign={0}
            label={n.summary}
            lines={2}
            maxWidthChars={48}
            wrap
            truncate
          />
          {n.body && <label
            class="body"
            wrap
            useMarkup
            halign={START}
            xalign={0}
            maxWidthChars={48}
            justifyFill
            label={n.body}
          />}
        </box>
      </box>
      {visibleActions.length > 0 && <box class="actions">
        {visibleActions.map(({ label, id }) => (
          <button
            hexpand
            tooltipText={n.actionIcons ? label : undefined}
            $={self => self.get_accessible().set_name(label)}
            onClicked={() => n.invoke(id)}>
            {n.actionIcons && isIcon(id)
              ? <icon icon={id} halign={CENTER} />
              : <label label={label} halign={CENTER} hexpand />}
          </button>
        ))}
      </box>}
    </box>
  </eventbox>
}
