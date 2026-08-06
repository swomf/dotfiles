import { Gtk, Astal } from "ags/gtk3"
import Gio from "gi://Gio?version=2.0"
import GLib from "gi://GLib?version=2.0"
import Pango from "gi://Pango?version=1.0"
import Notifd from "gi://AstalNotifd"

const isIcon = (icon: string) =>
  !!Astal.Icon.lookup_icon(icon)

function imageUri(image: string) {
  if (!image) return null
  const file = Gio.File.new_for_commandline_arg(image)
  return file.query_exists(null) ? file.get_uri() : null
}

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
  onHoverLost?(self: Astal.EventBox): void
  notification: Notifd.Notification
  setup?(self: Astal.EventBox): void
}

export default function Notification(props: Props) {
  const { notification: n, onHoverLost, setup } = props
  const { START, CENTER, END } = Gtk.Align
  const actions = n.get_actions()
  const defaultAction = actions.find(({ id }) => id === "default")
  const visibleActions = actions.filter(({ id }) => id !== "default")
  const uri = imageUri(n.image)
  const icon = n.image && !uri && isIcon(n.image) && n.image
  const errorCategory = ["device.error", "network.error", "transfer.error"].includes(n.category)

  return <eventbox
    class={`notification ${urgency(n)}${errorCategory ? " category-error" : ""}`}
    $={setup}
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
        <button canFocus={false} onClicked={() => n.dismiss()}>
          <icon icon="window-close-symbolic" />
        </button>
      </box>
      <Gtk.Separator visible />
      <box class="content">
        {uri && <box
          valign={START}
          class="image"
          css={`background-image: url("${uri}")`}
        />}
        {icon && <box
          expand={false}
          valign={CENTER}
          class="icon-image">
          <icon icon={icon} halign={CENTER} valign={CENTER} />
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
            wrapMode={Pango.WrapMode.WORD_CHAR}
            truncate
          />
          {n.body && <label
            class="body"
            wrap
            useMarkup
            halign={START}
            xalign={0}
            maxWidthChars={48}
            wrapMode={Pango.WrapMode.WORD_CHAR}
            justifyFill
            label={n.body}
          />}
        </box>
      </box>
      {visibleActions.length > 0 && <box class="actions">
        {visibleActions.map(({ label, id }) => (
          <button
            hexpand
            canFocus={false}
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
