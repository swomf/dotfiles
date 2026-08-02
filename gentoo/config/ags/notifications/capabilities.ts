import Gio from "gi://Gio?version=2.0"

// GtkLabel supports the notification markup subset except inline <img> tags.
// Keep the daemon's advertised capabilities aligned with this frontend.
export function configureNotificationCapabilities() {
  const settings = Gio.Settings.new("io.astal.notifd")
  const capabilities = settings.get_strv("server-capabilites")
  const supportedCapabilities = capabilities
    .filter(capability => capability !== "body-images")

  if (supportedCapabilities.length !== capabilities.length)
    settings.set_strv("server-capabilites", supportedCapabilities)
}
