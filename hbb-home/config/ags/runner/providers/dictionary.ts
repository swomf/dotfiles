import { execAsync } from "ags/process"
import type { Provider, RunnerResult } from "../types"

type ApiDefinition = {
  definition?: unknown
}

type ApiMeaning = {
  partOfSpeech?: unknown
  definitions?: ApiDefinition[]
}

type ApiEntry = {
  meanings?: ApiMeaning[]
}

// https://github.com/anyrun-org/anyrun/tree/master/plugins/dictionary
export const dictionaryProvider: Provider = {
  debounceMs: 300,
  matchInput(input) {
    return input.startsWith(":def") ? input.slice(4).trim() : null
  },
  async query(word, limit, offset = 0) {
    if (!word) return []

    try {
      const raw = await execAsync([
        "curl", "--fail", "--silent", "--show-error",
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
      ])
      const entries: unknown = JSON.parse(raw)
      if (!Array.isArray(entries)) return []

      return entries
        .flatMap((entry): RunnerResult[] => {
          if (!entry || typeof entry !== "object") return []
          const meanings = (entry as ApiEntry).meanings
          if (!Array.isArray(meanings)) return []

          return meanings.flatMap(meaning => {
            const definitions = meaning.definitions
            if (!Array.isArray(definitions)) return []
            const partOfSpeech = typeof meaning.partOfSpeech === "string"
              ? meaning.partOfSpeech
              : "Definition"

            return definitions.flatMap(definition => {
              if (typeof definition.definition !== "string") return []
              return [{
                title: definition.definition,
                description: partOfSpeech,
                icon: "accessories-dictionary",
                action: { kind: "copy", text: definition.definition },
              }]
            })
          })
        })
        .slice(offset, offset + limit)
    } catch {
      return []
    }
  },
}
