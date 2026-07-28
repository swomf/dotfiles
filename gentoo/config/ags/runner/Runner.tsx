import app from "ags/gtk3/app"
import { Astal } from "ags/gtk3"
import { execAsync } from "ags/process"
import { createState, For } from "ags"
import GLib from "gi://GLib?version=2.0"
import Gdk from "gi://Gdk?version=3.0"
import Gtk from "gi://Gtk?version=3.0"
import PangoCairo from "gi://PangoCairo?version=1.0"
import { appProvider } from "./providers/apps"
import { dictionaryProvider } from "./providers/dictionary"
import { emojiProvider } from "./providers/emoji"
import { rinkProvider } from "./providers/rink"
import { queryLines } from "./providers/stdin"
import { symbolProvider } from "./providers/symbols"
import { translateProvider } from "./providers/translate"
import type { Provider, RunnerResult } from "./types"

// dictionary before translation since both use colon prefix
const providers: Provider[] = [appProvider, rinkProvider, symbolProvider, dictionaryProvider, translateProvider]
const PAGE_SIZE = 8
const RESULT_MAX_WIDTH_CHARS = 54
const [results, setResults] = createState<RunnerResult[]>([])
const [selected, setSelected] = createState(0)
const [page, setPage] = createState(0)
const [hasNextPage, setHasNextPage] = createState(false)
const [prompt, setPrompt] = createState("Search applications")

let entry: Gtk.Entry
let generation = 0
let stdinLines: string[] | null = null
let stdinResponse: ((value: string) => void) | null = null
let pageQuery: ((limit: number, offset: number) => RunnerResult[] | Promise<RunnerResult[]>) | null = null
let forcedProvider: Provider | null = null

function dismissRunner(value = "") {
  generation++
  const response = stdinResponse
  stdinLines = null
  stdinResponse = null
  forcedProvider = null
  app.get_window("runner")!.hide()
  if (response) response(value)
}

// reset selection
// route to provider
// debounce
// publish
async function update(input: string) {
  const current = ++generation
  setSelected(0)
  setPage(0)
  setHasNextPage(false)
  pageQuery = null

  if (stdinLines) {
    const lines = stdinLines
    pageQuery = (limit, offset) => queryLines(lines, input, limit, offset)
    await publishPage(current, 0, 0)
    return
  }
  // dont rank if textbox input empty
  if (!input.trim()) {
    setResults([])
    return
  }

  const active = forcedProvider
    ? { provider: forcedProvider, query: input }
    : providers
      .map(provider => ({ provider, query: provider.matchInput(input) }))
      .find((match): match is { provider: Provider; query: string } => match.query !== null)
  if (!active) {
    setResults([])
    return
  }

  const delay = active.provider.debounceMs ?? 0
  if (delay) await new Promise(resolve => GLib.timeout_add(
    GLib.PRIORITY_DEFAULT,
    delay,
    () => {
      resolve(undefined)
      return GLib.SOURCE_REMOVE
    },
  ))
  if (current !== generation) return

  pageQuery = (limit, offset) => active.provider.query(active.query, limit, offset)
  await publishPage(current, 0, 0)
}

async function publishPage(current: number, nextPage: number, nextSelection: number) {
  const query = pageQuery
  if (!query) return

  // the extra result tells us whether another page exists without rendering it
  const next = await query(PAGE_SIZE + 1, nextPage * PAGE_SIZE)
  if (current !== generation) return

  const visible = next.slice(0, PAGE_SIZE)
  setResults(visible)
  setPage(nextPage)
  setHasNextPage(next.length > PAGE_SIZE)
  setSelected(Math.min(nextSelection, Math.max(visible.length - 1, 0)))
}

async function loadPage(nextPage: number, nextSelection: number) {
  if (!pageQuery) return
  const current = ++generation
  await publishPage(current, nextPage, nextSelection)
}

async function activateResult(index = selected()) {
  const result = results()[index]
  if (!result) return

  switch (result.action.kind) {
    case "launch":
      try {
        await result.action.run()
        dismissRunner()
      } catch (error) {
        console.error("runner: could not launch result:", error)
      }
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
  const length = results().length
  if (!length) return

  const next = selected() + amount
  if (next >= 0 && next < length) {
    setSelected(next)
  } else if (next >= length && hasNextPage()) {
    void loadPage(page() + 1, 0)
  } else if (next < 0 && page() > 0) {
    void loadPage(page() - 1, PAGE_SIZE - 1)
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

// bit of copypaste.
// is Runner.tsx too aware of providers?
export function openRunner() {
  stdinLines = null
  stdinResponse = null
  forcedProvider = null
  presentRunner("Search applications")
}

export function openEmojiRunner() {
  stdinLines = null
  stdinResponse = null
  forcedProvider = emojiProvider
  presentRunner("Search emoji")
}

export function openSymbolRunner() {
  stdinLines = null
  stdinResponse = null
  forcedProvider = symbolProvider
  presentRunner("Search Unicode symbols")
}

export function openStdin(lines: string[], response: (value: string) => void) {
  if (stdinResponse) stdinResponse("")
  stdinLines = lines
  stdinResponse = response
  forcedProvider = null
  presentRunner("Search")
}

function presentRunner(nextPrompt: string) {
  const window = app.get_window("runner")!
  setPrompt(nextPrompt)
  entry.text = ""
  update("")
  window.show()
  window.present()
  GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
    entry.grab_focus()
    entry.set_position(-1)
    return GLib.SOURCE_REMOVE
  })
}

export default function Runner() {
  const { TOP, RIGHT, BOTTOM, LEFT } = Astal.WindowAnchor

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
      anchor={TOP | RIGHT | BOTTOM | LEFT}
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
            <box class={results.as(items => items.length > 0 ? "runner-input" : "runner-input empty")}>
              <icon icon="system-search-symbolic" pixelSize={20} />
              <entry
                hexpand
                placeholderText={prompt}
                onChanged={self => update(self.text)}
                $={self => entry = self}
              />
            </box>
            <box class="runner-results" vertical visible={results.as(items => items.length > 0)}>
              <For each={results}>
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
