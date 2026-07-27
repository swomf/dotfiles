import AstalApps from "gi://AstalApps?version=0.1"
import type { Provider } from "../types"

const apps = new AstalApps.Apps()

// anyrun-org app launcher
export const appProvider: Provider = {
  matchInput(input) {
    return /^[=:;]/.test(input) ? null : input
  },
  query(input, limit) {
    return apps.fuzzy_query(input || null).slice(0, limit).map(application => ({
      title: application.name,
      description: application.description || application.executable,
      icon: application.iconName || "application-x-executable",
      action: { kind: "launch", run: () => {
        application.launch()
      } },
    }))
  },
}
