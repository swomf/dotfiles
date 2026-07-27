import { execAsync } from "ags/process"
import { fuzzyScore } from "../fuzzy"
import type { Provider, RunnerResult } from "../types"

// NOTE: this is based on
// https://github.com/anyrun-org/anyrun/blob/f3b23bc5520f7673a5119da44b3570fbe060db37/plugins/translate/src/lib.rs#L43
// at this commit, upstream erroneously had "ma" on punjabi instead of "pa".
const languages = [
  ["af", "Afrikaans"], ["sq", "Albanian"], ["am", "Amharic"],
  ["ar", "Arabic"], ["hy", "Armenian"], ["az", "Azerbaijani"],
  ["eu", "Basque"], ["be", "Belarusian"], ["bn", "Bengali"],
  ["bs", "Bosnian"], ["bg", "Bulgarian"], ["ca", "Catalan"],
  ["ceb", "Cebuano"], ["ny", "Chichewa"],
  ["zh-CN", "Chinese (Simplified)"], ["zh-TW", "Chinese (Traditional)"],
  ["co", "Corsican"], ["hr", "Croatian"], ["cs", "Czech"],
  ["da", "Danish"], ["nl", "Dutch"], ["en", "English"],
  ["eo", "Esperanto"], ["ee", "Ewe"], ["et", "Estonian"],
  ["tl", "Filipino"], ["fi", "Finnish"], ["fr", "French"],
  ["fy", "Frisian"], ["gl", "Galician"], ["ka", "Georgian"],
  ["de", "German"], ["el", "Greek"], ["gu", "Gujarati"],
  ["ht", "Haitian Creole"], ["ha", "Hausa"], ["haw", "Hawaiian"],
  ["iw", "Hebrew"], ["hi", "Hindi"], ["hmn", "Hmong"],
  ["hu", "Hungarian"], ["is", "Icelandic"], ["ig", "Igbo"],
  ["id", "Indonesian"], ["ga", "Irish"], ["it", "Italian"],
  ["ja", "Japanese"], ["jw", "Javanese"], ["kn", "Kannada"],
  ["kk", "Kazakh"], ["km", "Khmer"], ["ko", "Korean"],
  ["ku", "Kurdish (Kurmanji)"], ["ky", "Kyrgyz"], ["lo", "Lao"],
  ["la", "Latin"], ["lv", "Latvian"], ["lt", "Lithuanian"],
  ["lb", "Luxembourgish"], ["mk", "Macedonian"], ["mg", "Malagasy"],
  ["ms", "Malay"], ["ml", "Malayalam"], ["mt", "Maltese"],
  ["mi", "Maori"], ["mr", "Marathi"], ["mn", "Mongolian"],
  ["my", "Myanmar (Burmese)"], ["ne", "Nepali"], ["no", "Norwegian"],
  ["ps", "Pashto"], ["fa", "Persian"], ["pl", "Polish"],
  ["pt", "Portuguese"], ["pa", "Punjabi"], ["ro", "Romanian"],
  ["ru", "Russian"], ["sm", "Samoan"], ["gd", "Scots Gaelic"],
  ["sr", "Serbian"], ["st", "Sesotho"], ["sn", "Shona"],
  ["sd", "Sindhi"], ["si", "Sinhala"], ["sk", "Slovak"],
  ["sl", "Slovenian"], ["so", "Somali"], ["es", "Spanish"],
  ["su", "Sundanese"], ["sw", "Swahili"], ["sv", "Swedish"],
  ["tg", "Tajik"], ["ta", "Tamil"], ["te", "Telugu"],
  ["th", "Thai"], ["tr", "Turkish"], ["uk", "Ukrainian"],
  ["ur", "Urdu"], ["uz", "Uzbek"], ["vi", "Vietnamese"],
  ["cy", "Welsh"], ["xh", "Xhosa"], ["yi", "Yiddish"],
  ["yo", "Yoruba"], ["zu", "Zulu"],
] as const

function findLangMatches(query: string) {
  return languages
    .map(([code, name]) => ({
      code,
      name,
      score: Math.max(fuzzyScore(code, query) ?? -Infinity, fuzzyScore(name, query) ?? -Infinity),
    }))
    .filter(match => Number.isFinite(match.score))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
}

export const translateProvider: Provider = {
  debounceMs: 300,
  matchInput(input) {
    return input.startsWith(":") ? input.slice(1).trimStart() : null
  },
  async query(input, limit, offset = 0) {
    const match = input.match(/^(\S+)\s+(.+)$/)
    if (!match) return []
    const [, languageSpec, text] = match
    const [sourceQuery, destinationQuery] = languageSpec.includes(">")
      ? languageSpec.split(">", 2)
      : ["auto", languageSpec]
    if (!destinationQuery) return []

    const sources = sourceQuery === "auto"
      ? [{ code: "auto", name: "Auto" }]
      : findLangMatches(sourceQuery)
    const destinations = findLangMatches(destinationQuery)

    const pairs = sources
      .flatMap(source => destinations.map(destination => ({ source, destination })))
      .slice(offset, offset + limit)

    const results = await Promise.all(pairs.map(async ({ source, destination }) => {
      try {
        // https://github.com/anyrun-org/anyrun/blob/f3b23bc5520f7673a5119da44b3570fbe060db37/plugins/translate/src/lib.rs#L246
        const raw = await execAsync([
          "curl", "--fail", "--silent", "--show-error", "--get",
          "https://translate.googleapis.com/translate_a/single",
          "--data-urlencode", "client=gtx",
          "--data-urlencode", `sl=${source.code}`,
          "--data-urlencode", `tl=${destination.code}`,
          "--data-urlencode", "dt=t",
          "--data-urlencode", `q=${text}`,
        ])
        const json = JSON.parse(raw)
        const translated = json[0]
          .map((segment: unknown[]) => segment[0])
          .filter((segment: unknown) => typeof segment === "string")
          .join("")
        const detected = String(json[2] ?? source.code)
        const detectedName = languages.find(([code]) => code === detected)?.[1] ?? detected

        return {
          title: translated,
          description: `${detectedName} -> ${destination.name}`,
          icon: "preferences-desktop-locale",
          action: { kind: "copy", text: translated },
        } satisfies RunnerResult
      } catch {
        return null
      }
    }))

    return results.filter((result): result is RunnerResult => result !== null)
  },
}
