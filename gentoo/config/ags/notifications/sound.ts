import { Gtk } from "ags/gtk3"
import { execAsync } from "ags/process"
import GLib from "gi://GLib?version=2.0"
import Notifd from "gi://AstalNotifd"

const extensions = ["oga", "ogg", "wav"]

function soundTheme() {
  const theme = Gtk.Settings.get_default()?.gtk_sound_theme_name
  return theme || "freedesktop"
}

function findNamedSound(name: string) {
  // event names should be identifiers not paths
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) return null

  const roots = [
    GLib.build_filenamev([GLib.get_user_data_dir(), "sounds"]),
    ...GLib.get_system_data_dirs().map(dir =>
      GLib.build_filenamev([dir, "sounds"])),
  ]
  const themes = [...new Set([soundTheme(), "freedesktop"])]

  for (const root of roots) {
    for (const theme of themes) {
      for (const extension of extensions) {
        const path = GLib.build_filenamev([
          root, theme, "stereo", `${name}.${extension}`,
        ])
        if (GLib.file_test(path, GLib.FileTest.IS_REGULAR)) return path
      }
    }
  }

  return null
}

function play(path: string, eventName?: string) {
  const player = GLib.find_program_in_path("paplay")
  if (!player) {
    console.error("cannot play notification sound, paplay is not installed")
    return
  }

  const args = [
    player,
    "--client-name=ags",
    "--stream-name=Notification",
    "--property=media.role=event",
  ]
  if (eventName) args.push(`--property=event.id=${eventName}`)
  args.push(path)

  execAsync(args).catch(error =>
    console.error(`Failed to play notification sound: ${error}`))
}

// listen once at the application level so
// multi-monitor popups do not duplicate audio
export function initNotificationSounds() {
  const notifd = Notifd.get_default()

  notifd.connect("notified", (_, id) => {
    const notification = notifd.get_notification(id)
    if (!notification || notifd.dontDisturb || notification.suppressSound) return

    if (notification.soundFile &&
      GLib.file_test(notification.soundFile, GLib.FileTest.IS_REGULAR)) {
      play(notification.soundFile)
      return
    }

    if (notification.soundName) {
      const path = findNamedSound(notification.soundName)
      if (path) play(path, notification.soundName)
    }
  })
}
