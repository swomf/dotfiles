import { execAsync } from "ags/process"
import type { RunnerResult } from "../types"

type Meaning = {
  partOfSpeech?: string
  definitions: { definition: string }[]
}

// https://github.com/anyrun-org/anyrun/tree/master/plugins/dictionary
export async function searchDictionary(
  word: string,
  offset: number,
  limit: number,
): Promise<RunnerResult[]> {
  if (!word) return []

  try {
    const raw = await execAsync([
      "curl", "--fail", "--silent", "--show-error",
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
    ])
    const entries: { meanings: Meaning[] }[] = JSON.parse(raw)

    return entries
      .flatMap(entry => entry.meanings)
      .flatMap(({ partOfSpeech, definitions }) =>
        definitions.map(({ definition }): RunnerResult => ({
          title: definition,
          description: partOfSpeech,
          icon: "accessories-dictionary",
          action: { kind: "copy", text: definition },
        })),
      )
      .slice(offset, offset + limit)
  } catch {
    return []
  }
}
