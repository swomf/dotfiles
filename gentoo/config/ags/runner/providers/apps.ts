import AstalApps from "gi://AstalApps?version=0.1"
import type { RunnerResult } from "../types"

const apps = new AstalApps.Apps()

// anyrun-org app launcher
export function searchApps(input: string, limit: number): RunnerResult[] {
  return apps.fuzzy_query(input).slice(0, limit).map(application => ({
    title: application.name,
    description: application.description || application.executable,
    icon: application.iconName || "application-x-executable",
    action: { kind: "launch", run: () => application.launch() },
  }))
}
