import app from "ags/gtk3/app"
import { Astal } from "ags/gtk3"
import { execAsync } from "ags/process"
import { createState, For } from "ags"
import Gdk from "gi://Gdk?version=3.0"
import Gtk from "gi://Gtk?version=3.0"
import PangoCairo from "gi://PangoCairo?version=1.0"
import { searchEmoji } from "./providers/emoji"
import { searchApps } from "./providers/apps"
import { searchDictionary } from "./providers/dictionary"
import { searchRink } from "./providers/rink"
import { queryLines } from "./providers/stdin"
import { searchSymbols } from "./providers/symbols"
import { translate } from "./providers/translate"
import type { RunnerResult } from "./types"

const PAGE_SIZE = 8
const RESULT_MAX_WIDTH_CHARS = 54
const [page, setPage] = createState<{ offset: number; results: RunnerResult[] }>({ offset: 0, results: [] })
const visibleResults = page.as(page => page.results.slice(0, PAGE_SIZE))
const [selected, setSelected] = createState(0)

let entry: Gtk.Entry
let generation = 0 // shitty way to not render old data
type Chooser = { lines: string[]; respond: (value: string) => void } // typeof Chooser is object
type RunnerMode = Chooser | "emoji" | "symbols" | null
let mode: RunnerMode = null

function dismissRunner(value = "") {
  generation++
  app.get_window("runner")!.hide()
  if (mode && typeof mode === "object") mode.respond(value)
  mode = null
}

async function updateRunner(input: string, target?: { offset: number; selected: number }) {
  const current = ++generation
  const offset = target?.offset ?? 0
  const limit = PAGE_SIZE + 1 // extra row means another page exists
  let results: RunnerResult[]

  // the paging here is so that spammed unicode search doesnt obliterate our CPU

  if (mode && typeof mode === "object") {
    // its from choose so its typeof is object
    results = queryLines(mode.lines, input, offset, limit)
  } else if (!input.trim()) {
    results = []
  } else if (mode === "emoji") {
    results = searchEmoji(input, offset, limit)
  } else if (mode === "symbols" || input.startsWith(";")) {
    setPage({ offset, results: [] })
    if (!target) {
      await new Promise<void>(resolve => setTimeout(resolve, 60))
      if (current !== generation) return
    }
    results = searchSymbols(mode === "symbols" ? input : input.slice(1).trim(), offset, limit)
  } else {
    switch (input[0]) {
      case "=":
      case ":":
        setPage({ offset, results: [] })
        if (!target) {
          await new Promise<void>(resolve => setTimeout(resolve, input[0] === "=" ? 80 : 300))
          if (current !== generation) return
        }
        if (input[0] === "=") results = await searchRink(input.slice(1).trim())
        else if (input.startsWith(":def")) results = await searchDictionary(input.slice(4).trim(), offset, limit)
        else results = await translate(input.slice(1).trimStart(), offset, limit)
        if (current !== generation) return
        break
      default:
        results = searchApps(input, offset, limit)
    }
  }

  setSelected(Math.min(target?.selected ?? 0, Math.max(0, results.length - 1)))
  setPage({ offset, results })
}

function activateResult(index = selected()) {
  const result = visibleResults()[index]
  if (!result) return

  switch (result.action.kind) {
    case "launch":
      if (result.action.run()) dismissRunner()
      else console.error("runner: launch failed:", result.title)
      return
    case "copy":
      execAsync(["wl-copy", result.action.text])
      dismissRunner()
      return
    case "return":
      dismissRunner(result.action.text)
      return
  }
}

function moveSelection(amount: number) {
  const { offset, results } = page()
  if (!results.length) return
  const next = selected() + amount
  if (next >= 0 && next < Math.min(results.length, PAGE_SIZE)) {
    setSelected(next)
  } else if (next === PAGE_SIZE && results.length > PAGE_SIZE) {
    updateRunner(entry.text, { offset: offset + PAGE_SIZE, selected: 0 })
  } else if (next < 0 && offset > 0) {
    updateRunner(entry.text, { offset: offset - PAGE_SIZE, selected: PAGE_SIZE - 1 })
  }
}

function handleKeyPress(keyval: number) {
  switch (keyval) {
    case Gdk.KEY_Escape:
      dismissRunner()
      return true
    case Gdk.KEY_Down:
      moveSelection(1)
      return true
    case Gdk.KEY_Up:
      moveSelection(-1)
      return true
    case Gdk.KEY_Return:
    case Gdk.KEY_KP_Enter:
      activateResult()
      return true
    default:
      return false
  }
}

// gtk doesnt really have max-size so i do raw pango and pre allocate
// a drawing area. THATS your size.
// helps with drawing unicode cuneiform stuff for example.
function sizeGlyphWidth(area: Gtk.DrawingArea, glyph: string) {
  const [ink] = area.create_pango_layout(glyph).get_pixel_extents()
  if (!ink) return

  const width = Math.max(44, ink.width)
  if (area.get_size_request()[0] !== width) area.set_size_request(width, 44)
}

function drawGlyph(glyph: string) {
  return (area: Gtk.DrawingArea, cr: any) => {
    // NOTE: we dont keep track of state via save() and restore()
    // since there is simply no state transition to do.
    const context = area.get_style_context() // follow theme css
    const layout = area.create_pango_layout(glyph)

    // coloring stuff; fg black otherwise
    const color = context.get_color(Gtk.StateFlags.NORMAL)
    cr.setSourceRGBA(color.red, color.green, color.blue, color.alpha)

    // for centering. center by the "area with ink" not the "logical area"
    const [ink] = layout.get_pixel_extents()
    if (!ink) return true // return true means "its handled"; shouldnt be possible since it would just be 0x0
    sizeGlyphWidth(area, glyph)
    const allocation = area.get_allocation()
    cr.moveTo(
      (allocation.width - ink.width) / 2 - ink.x,
      (allocation.height - ink.height) / 2 - ink.y,
    )

    PangoCairo.show_layout(cr, layout)

    return true
  }
}

export function openRunner(next: RunnerMode = null) {
  if (mode && typeof mode === "object") mode.respond("")
  mode = next
  const window = app.get_window("runner")!
  entry.placeholder_text = next === "emoji" ? "Search emoji" :
    next === "symbols" ? "Search Unicode symbols" : next ? "Search" : "Search applications"
  entry.text = ""
  updateRunner("")
  window.show()
  window.present()
  entry.grab_focus()
}

export default function Runner() {
  return (
    <window
      name="runner"
      namespace="launcher" // this way it has the same namespace as fuzzel
      application={app}
      class="Runner"
      visible={false}
      layer={Astal.Layer.OVERLAY}
      keymode={Astal.Keymode.EXCLUSIVE}
      exclusivity={Astal.Exclusivity.IGNORE}
      anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT | Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.LEFT}
      onKeyPressEvent={(_, event) => handleKeyPress(event.get_keyval()[1]) /* yes it does*/}>
      <eventbox onButtonPressEvent={() => {
        dismissRunner()
        return true
      }}>
        <eventbox
          halign={Gtk.Align.CENTER}
          valign={Gtk.Align.START}
          onButtonPressEvent={() => true}>
          <box class="runner-shell" vertical>
            <box class={visibleResults.as(items => items.length > 0 ? "runner-input" : "runner-input empty")}>
              <icon icon="system-search-symbolic" pixelSize={20} />
              <entry
                hexpand
                onChanged={self => updateRunner(self.text)}
                $={self => entry = self}
              />
            </box>
            <box class="runner-results" vertical visible={visibleResults.as(items => items.length > 0)}>
              <For each={visibleResults}>
                {(result, index) => (
                  <button
                    class={selected.as(current => current === index() ? "selected" : "")}
                    onClicked={() => activateResult(index())}>
                    <box class="runner-result">
                      {result.icon && <icon icon={result.icon} pixelSize={44} />}
                      {!result.icon && result.glyph && <drawingarea
                        class="result-glyph-slot"
                        heightRequest={44}
                        halign={Gtk.Align.CENTER}
                        valign={Gtk.Align.CENTER}
                        onDraw={drawGlyph(result.glyph)}
                        onStyleUpdated={area => sizeGlyphWidth(area, result.glyph!)}
                      />}
                      <box vertical hexpand spacing={2} valign={Gtk.Align.CENTER}>
                        <label
                          class="title"
                          label={result.title}
                          xalign={0}
                          truncate
                          maxWidthChars={RESULT_MAX_WIDTH_CHARS}
                        />
                        <label
                          class="description"
                          label={result.description ?? ""}
                          xalign={0}
                          truncate
                          maxWidthChars={RESULT_MAX_WIDTH_CHARS}
                          visible={Boolean(result.description)}
                        />
                      </box>
                    </box>
                  </button>
                )}
              </For>
            </box>
          </box>
        </eventbox>
      </eventbox>
    </window>
  )
}
