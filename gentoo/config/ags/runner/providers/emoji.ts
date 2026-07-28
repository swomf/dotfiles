import GLib from "gi://GLib?version=2.0"
import { fuzzyScore, topKScorers } from "../fuzzy"
import type { RunnerResult } from "../types"

type EmojiEntry = { value: string; terms: string }
let emojis: EmojiEntry[] | null = null

const dataDir = GLib.build_filenamev([
  GLib.get_user_config_dir(),
  "ags",
  "runner",
  "providers",
  "emojidata",
])

function findEmojiSvgPath(emoji: string): string | undefined {
  const hexCodepoints = Array.from(emoji, char => char.codePointAt(0)!.toString(16))
  const hexCodepointsWithFe0fStripped = hexCodepoints.filter(hex => hex !== "fe0f")
  const possibleSvgNames = hexCodepoints.includes("200d")
    ? [hexCodepoints.join("-"), hexCodepointsWithFe0fStripped.join("-")]
    : [hexCodepointsWithFe0fStripped.join("-")]

  for (const name of possibleSvgNames) {
    const path = `${dataDir}/svg/${name}.svg`
    if (GLib.file_test(path, GLib.FileTest.IS_REGULAR)) return path
  }
}

function parse_tags(text: string): string[] {
  return text
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .flatMap(tag => /[\p{L}\p{N}]/u.test(tag) ? tag.split(/[_-]+/) : [tag])
    .filter(Boolean)
}

function loadEmojis(): EmojiEntry[] {
  try {
    const [ok, bytes] = GLib.file_get_contents(`${dataDir}/emoji-data.generated`)
    if (!ok) return []

    const entries: EmojiEntry[] = []
    for (const line of new TextDecoder().decode(bytes).split(/\r?\n/)) {
      const [emoji, ...entryTags] = line.split(/\s+/)
      if (emoji) entries.push({ value: emoji, terms: entryTags.join(" ") })
    }

    try {
      const [overridesOk, overrides] = GLib.file_get_contents(`${dataDir}/emoji-overrides`)
      if (!overridesOk) return entries

      const overrideData = new TextDecoder().decode(overrides)
      if (!overrideData.trim()) return entries

      const emojiTags = new Map(entries.map(({ value, terms }) => [value, new Set(parse_tags(terms))]))
      for (const line of overrideData.split(/\r?\n/)) {
        const content = line.replace(/\s+#.*$/, "")
        const match = content.match(/^\s*(\S+)\s+([+=-])(?:\s+(.*))?\s*$/)
        if (!match) continue

        const [, value, operation, terms = ""] = match
        const overrideTags = parse_tags(terms)
        const current = emojiTags.get(value)

        if (operation === "=") {
          emojiTags.set(value, new Set(overrideTags))
        } else if (operation === "+") {
          const next = current ?? new Set<string>()
          overrideTags.forEach(tag => next.add(tag))
          emojiTags.set(value, next)
        } else if (current) {
          overrideTags.forEach(tag => current.delete(tag))
        }
      }

      return Array.from(emojiTags, ([value, entryTags]) => ({
        value,
        terms: Array.from(entryTags).join(" "),
      }))
    } catch { }

    return entries
  } catch { }

  console.error(`runner: emoji data was not found at ${dataDir}`)
  return []
}

export function searchEmoji(query: string, offset: number, limit: number): RunnerResult[] {
  if (!query) return []

  return topKScorers(emojis ??= loadEmojis(), entry => fuzzyScore(entry.terms, query, true), offset + limit)
    .slice(offset)
    .map(({ entry }) => ({
      title: entry.terms,
      icon: findEmojiSvgPath(entry.value),
      glyph: entry.value,
      action: { kind: "copy", text: entry.value },
    }))
}
