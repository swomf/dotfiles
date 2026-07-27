import { execAsync } from "ags/process"
import type { Provider } from "../types"

// anyrun-org rink talker
// needs sci-mathematics/rink
//
// btw. do we even care about currency conversion?
// https://github.com/anyrun-org/anyrun/blob/f3b23bc5520f7673a5119da44b3570fbe060db37/plugins/rink/src/lib.rs#L34
export const rinkProvider: Provider = {
  debounceMs: 80,
  matchInput(input) {
    return input.startsWith("=") ? input.slice(1).trim() : null
  },
  async query(expression) {
    if (!expression) return []

    try {
      const output = await execAsync(["rink", expression])
      const lines = output
        .split("\n")
        .map(line => line.trim())
        .filter(line => line && !line.startsWith(">") && !line.startsWith("Input:"))
      const result = lines.at(-1)
      if (!result) return []

      // https://github.com/anyrun-org/anyrun/blob/master/plugins/rink/src/lib.rs#L107
      // "The description is anything inside brackets from `rink`, if present"
      const [title, annotation] = result.split(" (", 2)
      const description = annotation?.replace(/\)+$/, "") ?? "Rink"

      return [{
        title,
        description,
        icon: "accessories-calculator",
        action: { kind: "copy", text: title },
      }]
    } catch {
      return []
    }
  },
}
