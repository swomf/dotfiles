import { fuzzyScore } from "../fuzzy"
import type { RunnerResult } from "../types"

export function queryLines(
  lines: string[],
  input: string,
  limit: number,
  offset = 0,
): RunnerResult[] {
  // dont rank if no user input (e.g. fresh cliphist feeding)
  const matches = input
    ? lines
      .map((line, index) => ({ line, index, score: fuzzyScore(line, input) }))
      .filter((match): match is typeof match & { score: number } => match.score !== null)
      .sort((a, b) => b.score - a.score || a.index - b.index)
    : lines.map((line, index) => ({ line, index }))

  return matches
    .slice(offset, offset + limit)
    .map(({ line }): RunnerResult => ({
      title: line,
      action: { kind: "return", text: line },
    }))
}
