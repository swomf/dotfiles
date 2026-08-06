import GLib from "gi://GLib?version=2.0"
import { fuzzyScore, topKScorers } from "../fuzzy"
import type { RunnerResult } from "../types"

type SymbolEntry = { char: string; name: string; lower: string; mask: number }
let symbols: SymbolEntry[] | null = null

/* anyrun-org uses UnicodeData.txt but I don't want to vendor/maintain that
 * in my dotfiles so I looked for it in disk.
 * Here is the equery b report for my machine
 *
 * equery b /usr/share/texmf-dist/tex/generic/unicode-data/UnicodeData.txt
 * --> dev-texlive/texlive-basic.
 *     revdeps --> app-text/texlive. But not all users have tex
 *
 * equery b /usr/share/unicode-data/UnicodeData.txt
 * --> app-i18n/unicode-data
 *     revdeps --> app-i18n/ibus[+unicode]
 *                 revdeps --> app-i18n/mozc[+ibus] // Japanese IME, niche
 *                         --> games-util/steam-launcher[!+steamruntime]::steamoverlay // override => not reliable
 *                         --> media-libs/libsdl2
 *                             revdeps --> A LOT of them. here are selected forced/common USE ones
 *                                     --> app-emulation/wine-proton[+sdl] // GAMERS
 *                                     --> dev-build/meson // C++ COMPILING
 *                                     --> gegl -> movit -> mlt[+opengl] -> krita, kdenlive // ARTISTS
 *             --> dev-libs/libutf8proc[test] // not mandatory
 *             --> media-libs/fcft
 *                 revdeps --> gui-apps/foot   // my fav term app; not the most popular
 *                         --> gui-apps/fuzzel // ill replace fuzzel with this though.
 *
 * Due to the meson indirect reverse dep it's good to assume that
 *     /usr/share/unicode-data/UnicodeData.txt
 * is available.
 *
 *
 **/

function letterMask(text: string): number {
  // basically, if we have something like "arrow", it hits the bits for a,o,r,w.
  // - it doesnt reject anything fuzzyScore wouldnt reject
  // - it saves cpu on massive bullshit namely the unicode search
  //   (a lot is geared around fighting this)
  let mask = 0
  for (let index = 0; index < text.length; index++) {
    const codepoint = text.charCodeAt(index) - 97
    if (codepoint >= 0 && codepoint < 26) mask |= 1 << codepoint
  }
  return mask
}

function loadSymbols(): SymbolEntry[] {
  // https://gnome.pages.gitlab.gnome.org/glibmm/group__FileUtils.html
  const unicodeData = "/usr/share/unicode-data/UnicodeData.txt"
  if (!GLib.file_test(unicodeData, GLib.FileTest.EXISTS)) return []
  const [, bytes] = GLib.file_get_contents(unicodeData)

  const entries: SymbolEntry[] = []
  for (const line of new TextDecoder().decode(bytes).split(/\n/)) { // \r? isnt needed; idk if it goes faster w/o.
    const [hex, name] = line.split(";")

    // https://github.com/anyrun-org/anyrun/blob/f3b23bc5520f7673a5119da44b3570fbe060db37/plugins/symbols/build.rs#L16
    // most <control> isnt visible on its own anyway so we keep that
    if (!hex || !name || name === "<control>") continue

    const codepoint = Number.parseInt(hex, 16)

    // upstream does a from u32 check but i dont think we need it.
    if (codepoint >= 0xd800 && codepoint <= 0xdfff) continue

    const lower = name.toLowerCase()
    entries.push({ char: String.fromCodePoint(codepoint), name, lower, mask: letterMask(lower) })
  }
  return entries
}

export function searchSymbols(query: string, offset: number, limit: number): RunnerResult[] {
  if (!query) return []

  const entries = symbols ??= loadSymbols() // massive, use only if needed
  const lower = query.toLowerCase()
  const mask = letterMask(lower)
  const caseSensitive = query !== lower
  return topKScorers(entries, entry => {
    if ((entry.mask & mask) !== mask) return null
    return fuzzyScore(caseSensitive ? entry.name : entry.lower, query, true)
  }, offset + limit).slice(offset).map(({ entry }) => ({
    glyph: entry.char,
    title: entry.name,
    action: { kind: "copy", text: entry.char },
  }))
}
