import app from "ags/gtk3/app"
import { Astal, Gtk, Gdk } from "ags/gtk3"
import { createBinding, createEffect, createMemo, createState, For, onCleanup } from "ags"
import cairo from "cairo"
import GLib from "gi://GLib?version=2.0"
import Notifd from "gi://AstalNotifd"
import Notification from "./Notification"

export const WINDOW_NAME = "notification-center"
const NO_NOTIFICATIONS: Notifd.Notification[] = []
export const [notificationCenterOpen, setNotificationCenterOpen] =
  createState(false)

// The daemon expires notifications on its own by default, which would empty
// the center as soon as a popup times out. Popups keep their own timers
// instead, so notifications live here until the user resolves them.
export function configureNotificationPersistence() {
  Notifd.get_default().ignoreTimeout = true
}

export function toggleNotificationCenter() {
  const window = app.get_window(WINDOW_NAME)
  if (window) window.visible = !window.visible
}

export function openNotificationCenter() {
  const window = app.get_window(WINDOW_NAME)
  if (window) window.visible = true
}

export function closeNotificationCenter() {
  app.get_window(WINDOW_NAME)?.hide()
}

/** Newest first, as shown in the list. */
export function notificationList() {
  const notifd = Notifd.get_default()
  return createBinding(notifd, "notifications")
    .as(list => list.toSorted((a, b) => b.time - a.time))
}

type Rectangle = cairo.RectangleInt

const intersection = (a: Rectangle, b: Rectangle): Rectangle | null => {
  const x = Math.max(a.x, b.x)
  const y = Math.max(a.y, b.y)
  const right = Math.min(a.x + a.width, b.x + b.width)
  const bottom = Math.min(a.y + a.height, b.y + b.height)
  return right > x && bottom > y
    ? { x, y, width: right - x, height: bottom - y }
    : null
}

function Header(props: {
  clearing(): boolean
  clearNotifications(): void
  setup(self: Gtk.Widget): void
}) {
  const notifd = Notifd.get_default()
  const notifications = createBinding(notifd, "notifications")
  const count = createMemo(() =>
    props.clearing() ? 0 : notifications().length)
  const canClear = createMemo(() =>
    !props.clearing() && notifications().length > 0)

  // These are pointer-only. Left focusable, GTK hands the first one focus when
  // the window maps and the compositor gives this ON_DEMAND layer keyboard
  // focus -- so an Enter pressed right after opening would clear everything.
  return <box class="notification-center-header" $={props.setup}>
    <label
      class="title"
      halign={Gtk.Align.START}
      label="Notifications"
    />
    <box hexpand />
    <label class="count" label={count.as(String)} />
    <button
      class="clear"
      canFocus={false}
      tooltipText="Clear all"
      sensitive={canClear}
      onClicked={props.clearNotifications}>
      <icon icon="user-trash-symbolic" />
    </button>
    <button
      class="close"
      canFocus={false}
      valign={Gtk.Align.CENTER}
      tooltipText="Close notification center"
      onClicked={closeNotificationCenter}>
      <icon icon="window-close-symbolic" />
    </button>
  </box>
}

export default function NotificationCenter() {
  const { TOP, RIGHT, BOTTOM } = Astal.WindowAnchor
  const notifd = Notifd.get_default()
  const notifications = notificationList()
  const [clearing, setClearing] = createState(false)

  // GTK3 For detaches and reattaches every surviving child whenever its input
  // changes. Keep its input at one stable empty array while clear-all emits a
  // resolved signal for each notification, avoiding quadratic widget churn.
  const displayedNotifications = createMemo(() =>
    clearing() ? NO_NOTIFICATIONS : notifications())
  const hasDisplayedNotifications = createMemo(() =>
    displayedNotifications().length > 0)
  // Stay full height even when empty. Toggling BOTTOM off resizes the layer
  // surface, and the compositor stretches the stale frame while it reconfigures.
  // The input region below keeps the empty area click-through anyway.
  const anchor = TOP | RIGHT | BOTTOM
  let window: Astal.Window | null = null
  let shell: Gtk.Widget | null = null
  let header: Gtk.Widget | null = null
  let scroller: Astal.Scrollable | null = null
  let list: Gtk.Box | null = null
  let inputRegionSource = 0
  let enterSource = 0
  let adjustmentHandler = 0

  // The .entering class snaps the shell to its parked state; dropping it a
  // frame later lets the stylesheet's transitions animate it into place.
  // Without the idle hop both states land in one style pass and nothing moves.
  const playEnterAnimation = () => {
    if (!shell || enterSource) return
    shell.get_style_context().add_class("entering")
    enterSource = GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
      enterSource = 0
      shell?.get_style_context().remove_class("entering")
      return GLib.SOURCE_REMOVE
    })
  }

  // A notification arriving while the center is open just blinks into the list:
  // the surface is a fixed rectangle, so the compositor never sees a geometry
  // change to animate. Give the row the slide-from-right the popups get.
  // `$` runs once when the widget is built, so this fires only for genuinely
  // new notifications -- unlike a map handler, which GTK3's For would replay
  // for every surviving row on each list change.
  const playRowEnterAnimation = (row: Gtk.Widget) => {
    const context = row.get_style_context()
    context.add_class("entering")
    GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
      context.remove_class("entering")
      return GLib.SOURCE_REMOVE
    })
  }

  const resetEnterAnimation = () => {
    if (enterSource) {
      GLib.source_remove(enterSource)
      enterSource = 0
    }
    shell?.get_style_context().remove_class("entering")
  }

  const widgetRectangle = (widget: Gtk.Widget): Rectangle | null => {
    if (!window || !widget.get_mapped()) return null
    const [translated, x, y] = widget.translate_coordinates(window, 0, 0)
    if (!translated) return null
    return {
      x,
      y,
      width: widget.get_allocated_width(),
      height: widget.get_allocated_height(),
    }
  }

  const updateInputRegion = () => {
    if (!window?.get_realized() || !header || !scroller || !list) return

    const region = new cairo.Region()
    const headerRectangle = widgetRectangle(header)
    if (headerRectangle) region.unionRectangle(headerRectangle)

    const viewport = list.get_parent()
    const viewportRectangle = viewport && widgetRectangle(viewport)
    if (viewportRectangle) {
      for (const row of list.get_children()) {
        const card = (row as Gtk.Bin).get_child() ?? row
        const cardRectangle = widgetRectangle(card)
        const visibleRectangle = cardRectangle &&
          intersection(cardRectangle, viewportRectangle)
        if (visibleRectangle) region.unionRectangle(visibleRectangle)
      }
    }

    const scrollbar = scroller.get_vscrollbar()
    const scrollbarRectangle = scrollbar && widgetRectangle(scrollbar)
    if (scrollbarRectangle) region.unionRectangle(scrollbarRectangle)

    window.get_window()?.input_shape_combine_region(region, 0, 0)
  }

  const scheduleInputRegion = () => {
    if (inputRegionSource) return
    inputRegionSource = GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
      inputRegionSource = 0
      updateInputRegion()
      return GLib.SOURCE_REMOVE
    })
  }

  createEffect(() => {
    displayedNotifications()
    scheduleInputRegion()
  })

  onCleanup(() => {
    if (inputRegionSource) GLib.source_remove(inputRegionSource)
    if (enterSource) GLib.source_remove(enterSource)
    if (adjustmentHandler && scroller)
      scroller.get_vadjustment().disconnect(adjustmentHandler)
  })

  const clearNotifications = () => {
    if (clearing.peek()) return

    const pending = [...notifd.get_notifications()]
    if (pending.length === 0) return

    let index = 0
    setClearing(true)
    GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
      pending[index++]?.dismiss()
      const done = index >= pending.length
      if (done) setClearing(false)
      return done ? GLib.SOURCE_REMOVE : GLib.SOURCE_CONTINUE
    })
  }

  return <window
    name={WINDOW_NAME}
    namespace={WINDOW_NAME}
    application={app}
    class="notification-center"
    visible={false}
    onNotifyVisible={self => {
      setNotificationCenterOpen(self.visible)
      if (!self.visible) resetEnterAnimation()
    }}
    layer={Astal.Layer.OVERLAY}
    // NONE, not ON_DEMAND: hyprland hands an on-demand layer keyboard focus the
    // moment it maps, which silently steals typing from the focused window
    // until the pointer moves. Costs us the Escape binding below.
    keymode={Astal.Keymode.NONE}
    exclusivity={Astal.Exclusivity.IGNORE}
    anchor={anchor}
    onSizeAllocate={scheduleInputRegion}
    onMapEvent={() => {
      scheduleInputRegion()
      playEnterAnimation()
      return false
    }}
    $={self => window = self}
    onKeyPressEvent={(_, event) => {
      if (event.get_keyval()[1] === Gdk.KEY_Escape) { // yes it does
        closeNotificationCenter()
        return true
      }
      return false
    }}>
    <box class="notification-center-shell" vertical $={self => shell = self}>
      <Header
        clearing={clearing}
        clearNotifications={clearNotifications}
        setup={self => header = self}
      />
      <scrollable
        class="notification-center-scroll"
        visible={hasDisplayedNotifications}
        vexpand
        hscroll={Gtk.PolicyType.NEVER}
        vscroll={Gtk.PolicyType.AUTOMATIC}
        onSizeAllocate={scheduleInputRegion}
        $={self => {
          scroller = self
          adjustmentHandler = self.get_vadjustment()
            .connect("value-changed", scheduleInputRegion)
        }}>
        <box
          class="notification-center-list"
          vertical
          onSizeAllocate={scheduleInputRegion}
          $={self => list = self}>
          <For each={displayedNotifications}>
            {notification => (
              <Notification
                notification={notification}
                relativeTime
                setup={playRowEnterAnimation}
              />
            )}
          </For>
        </box>
      </scrollable>
    </box>
  </window>
}
