import app from "ags/gtk3/app"
import { Astal, Gtk } from "ags/gtk3"
import { createBinding, createEffect, createMemo, createState, For, onCleanup } from "ags"
import cairo from "cairo"
import GLib from "gi://GLib?version=2.0"
import Notifd from "gi://AstalNotifd"
import Notification from "./Notification"

const windowName = "notification-center"
const [centerOpen, setCenterOpen] = createState(false)
export { centerOpen }

export function showCenter(visible?: boolean) {
  const window = app.get_window(windowName)
  if (window) window.visible = visible ?? !window.visible
}

// we animate the slight downwardness.
// the notification topbar comes first, then the notifs itself
// note that hypr/wm/rules.lua lets this control its own anims
function animateEntry(widget: Gtk.Widget) {
  const style = widget.get_style_context()
  style.add_class("entering")
  GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
    style.remove_class("entering")
    return GLib.SOURCE_REMOVE
  })
}

export default function NotificationCenter() {
  const { TOP, RIGHT, BOTTOM } = Astal.WindowAnchor
  const notifd = Notifd.get_default()
  const notifications = createBinding(notifd, "notifications")
  const [isClearingNotifs, setIsClearingNotifs] = createState(false)
  // accessor, whenver notifications()'s binding is touched,
  const sortedNotifs = createMemo(() => {
    if (isClearingNotifs())
      // immediately zero out the notification list so that For is instant
      // (otherwise we'd do a for loop over notifs and send that to For and
      // cause n rebuilds which just time complexity explodes)
      // this should push 500ms to like 50ms, thus no laggy clear.
      return []
    else
      return notifications().toSorted(
        (a, b) => b.time - a.time)
  })
  const count = sortedNotifs.as(list => list.length)
  const hasNotifs = count.as(n => n > 0)

  let window: Astal.Window
  let header: Gtk.Widget
  let scroller: Astal.Scrollable
  let list: Gtk.Box
  let rafId = 0

  function rectangle(widget: Gtk.Widget | null) {
    if (!widget?.get_mapped()) return null // skip anything hidden
    const [ok, x, y] = widget.translate_coordinates(window, 0, 0) // top left
    if (ok) return { x, y, width: widget.get_allocated_width(), height: widget.get_allocated_height() }
    return null
  }

  // clicking on gaps between notifications in the center
  // will click past/beneath it instead. i.e.
  // region <- (card1 U card2 U ... U cardn) inter (viewport U topbar U scrollbar)
  //
  // this is a bit annoying but basically astal's click through is too all-or-nothing,
  // so i can't put "holes". therefore i need to do glib stuff on my own.
  function updateInputRegion() {
    const surface = window?.get_window()
    if (!surface || !list || !header || !scroller) return

    const region = new cairo.Region() // sweaty
    const viewport = rectangle(list.get_parent())
    if (viewport) {
      for (const row of list.get_children()) {
        const bounds = rectangle((row as Gtk.Bin).get_child())
        if (bounds) region.unionRectangle(bounds)
      }
      region.intersectRectangle(viewport)
    }
    for (const widget of [header, scroller.get_vscrollbar()]) {
      const bounds = rectangle(widget)
      if (bounds) region.unionRectangle(bounds)
    }
    // https://discourse.gnome.org/t/how-to-create-a-transparent-window-in-gdk-3-that-passes-mouse-events/
    surface.input_shape_combine_region(region, 0, 0)
  }

  function scheduleUpdateInputRegion() {
    // this is basically the same as requestAnimationFrame(()=> rafId = 0; update())
    // on the browser.
    // rafId is nonzero iff dirty iff work is queued to update the input region's holes/gaps/whatnot
    if (rafId) return
    rafId = GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
      rafId = 0
      updateInputRegion()
      return GLib.SOURCE_REMOVE
    })
  }

  createEffect(() => {
    sortedNotifs()
    scheduleUpdateInputRegion()
  })
  onCleanup(() => {
    // its not really a free() its more of a removeEventListener() or clearTimeout()
    // type thing. i dont think this affects me directly yet since i do not have
    // multiple monitors as of writing this comment.
    if (rafId) GLib.source_remove(rafId)
  })

  function clearNotifications() {
    setIsClearingNotifs(true) // suppress redraw
    for (const notifs of notifications.peek()) notifs.dismiss()
    setIsClearingNotifs(false)
  }

  return <window
    name={windowName}
    namespace={windowName}
    application={app}
    class="notification-center"
    visible={false}
    onNotifyVisible={self => setCenterOpen(self.visible)}
    layer={Astal.Layer.OVERLAY}
    keymode={Astal.Keymode.NONE}
    exclusivity={Astal.Exclusivity.IGNORE}
    anchor={TOP | RIGHT | BOTTOM}
    onSizeAllocate={scheduleUpdateInputRegion}
    $={self => window = self}>
    <box class="notification-center-shell" vertical onMap={animateEntry}>
      <box class="notification-center-header" $={self => header = self}>
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
          sensitive={hasNotifs}
          onClicked={clearNotifications}>
          <icon icon="user-trash-symbolic" />
        </button>
        <button
          class="close"
          canFocus={false}
          valign={Gtk.Align.CENTER}
          tooltipText="Close notification center"
          onClicked={() => window.hide()}>
          <icon icon="window-close-symbolic" />
        </button>
      </box>
      <scrollable
        class="notification-center-scroll"
        visible={hasNotifs}
        vexpand
        hscroll={Gtk.PolicyType.NEVER}
        vscroll={Gtk.PolicyType.AUTOMATIC}
        onSizeAllocate={scheduleUpdateInputRegion}
        $={self => {
          scroller = self
          const adjustment = self.get_vadjustment()
          const handler = adjustment.connect("value-changed", scheduleUpdateInputRegion)
          onCleanup(() => adjustment.disconnect(handler))
        }}>
        <box
          class="notification-center-list"
          vertical
          onSizeAllocate={scheduleUpdateInputRegion}
          $={self => list = self}>
          <For each={sortedNotifs}>
            {notification => (
              <Notification
                notification={notification}
                setup={animateEntry}
              />
            )}
          </For>
        </box>
      </scrollable>
    </box>
  </window>
}
