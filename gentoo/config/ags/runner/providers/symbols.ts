import GLib from "gi://GLib?version=2.0"
import { fuzzyScore, topMatches } from "../fuzzy"
import type { Provider } from "../types"

type SymbolData = {
  codepoints: Uint32Array
  names: string[]
  namesLower: string[]
  nameMasks: Uint32Array
}
let symbols: SymbolData | null = null

function characterMask(text: string): number {
  let mask = 0
  for (let index = 0; index < text.length; index++) {
    const codepoint = text.charCodeAt(index) - 97
    if (codepoint >= 0 && codepoint < 26) mask |= 1 << codepoint
  }
  return mask
}

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

function loadSymbols(): SymbolData {
  try {
    // https://github.com/anyrun-org/anyrun/blob/master/plugins/symbols/build.rs
    // one important difference from upstream is that we arent vendoring this
    // in raw rust. so we dont have to deal with build issues from generated files,
    // see https://github.com/anyrun-org/anyrun/pull/229.
    //
    // i wonder why they dont just depend on unicode-data :thonk: maybe its dirtier?
    const [ok, bytes] = GLib.file_get_contents("/usr/share/unicode-data/UnicodeData.txt")
    if (!ok) return { codepoints: new Uint32Array(), names: [], namesLower: [], nameMasks: new Uint32Array() }

    const codepoints: number[] = []
    const names: string[] = []
    const namesLower: string[] = []
    const nameMasks: number[] = []
    for (const line of new TextDecoder().decode(bytes).split(/\n/)) { // \r? isnt needed; idk if it goes faster w/o.
      const [hex, name] = line.split(";")

      // https://github.com/anyrun-org/anyrun/blob/f3b23bc5520f7673a5119da44b3570fbe060db37/plugins/symbols/build.rs#L16
      // most <control> isnt visible on its own anyway so we keep that
      if (!hex || !name || name === "<control>") continue

      const codepoint = Number.parseInt(hex, 16)

      // upstream does a from u32 check but i dont think we need it.
      if (codepoint >= 0xd800 && codepoint <= 0xdfff) continue

      const nameLower = name.toLowerCase()
      codepoints.push(codepoint)
      names.push(name)
      namesLower.push(nameLower)
      nameMasks.push(characterMask(nameLower))
    }
    return { codepoints: Uint32Array.from(codepoints), names, namesLower, nameMasks: Uint32Array.from(nameMasks) }
  } catch { }
  console.error("runner: UnicodeData.txt was not found; symbols are unavailable")
  return { codepoints: new Uint32Array(), names: [], namesLower: [], nameMasks: new Uint32Array() }
}

export const symbolProvider: Provider = {
  debounceMs: 60,
  matchInput(input) {
    return input.startsWith(";") ? input.slice(1).trim() : null
  },
  query(query, limit, offset = 0) {
    if (!query) return []

    const queryMask = characterMask(query.toLowerCase())
    const entries = symbols ??= loadSymbols() // massive, use only if needed
    return topMatches(
      entries.namesLower,
      (nameLower, index) => {
        if ((entries.nameMasks[index] & queryMask) !== queryMask) return null
        return fuzzyScore(nameLower, query, true)
      },
      offset + limit,
    )
      .slice(offset, offset + limit)
      .map(({ index }) => ({
        title: String.fromCodePoint(entries.codepoints[index]),
        description: entries.names[index],
        icon: "accessories-character-map",
        action: { kind: "copy", text: String.fromCodePoint(entries.codepoints[index]) },
      }))
  },
}
