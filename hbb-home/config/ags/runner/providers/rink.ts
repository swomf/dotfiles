import { execAsync } from "ags/process"
import type { RunnerResult } from "../types"

// anyrun-org rink talker
// needs sci-mathematics/rink
//
// btw. do we even care about currency conversion?
// https://github.com/anyrun-org/anyrun/blob/f3b23bc5520f7673a5119da44b3570fbe060db37/plugins/rink/src/lib.rs#L34
export async function searchRink(expression: string): Promise<RunnerResult[]> {
  if (!expression) return []

  try {
    const result = (await execAsync(["rink", expression]))
      .split("\n")
      .map(line => line.trim())
      .filter(line => line && !line.startsWith(">") && !line.startsWith("Input:"))
      .at(-1)
    if (!result) return []

    // https://github.com/anyrun-org/anyrun/blob/master/plugins/rink/src/lib.rs#L107
    // "The description is anything inside brackets from `rink`, if present"
    const [title, description] = result.split(" (", 2)

    return [{
      title,
      description: description?.replace(/\)+$/, "") ?? "Rink",
      icon: "accessories-calculator",
      action: { kind: "copy", text: title },
    }]
  } catch {
    return []
  }
}
