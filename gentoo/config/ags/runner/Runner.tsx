import app from "ags/gtk3/app"
import { Astal } from "ags/gtk3"
import { execAsync } from "ags/process"
import { createState, For } from "ags"
import Gdk from "gi://Gdk?version=3.0"
import Gtk from "gi://Gtk?version=3.0"
import { searchApps } from "./providers/apps"
import { searchRink } from "./providers/rink"
import { queryLines } from "./providers/stdin"
import { searchSymbols } from "./providers/symbols"
import { translate } from "./providers/translate"
import type { RunnerResult } from "./types"

const RESULT_LIMIT = 8
const [results, setResults] = createState<RunnerResult[]>([])
const [selected, setSelected] = createState(0)

let entry: Gtk.Entry
let generation = 0 // shitty way to not render old data
type Chooser = { lines: string[]; respond: (value: string) => void }
let chooser: Chooser | null = null

function dismissRunner(value = "") {
  generation++
  app.get_window("runner")!.hide()
  chooser?.respond(value)
  chooser = null
}

function updateRunner(input: string) {
  const current = ++generation
  setSelected(0)
  if (chooser) {
    setResults(queryLines(chooser.lines, input))
    return
  }
  if (!input.trim()) {
    setResults([])
    return
  }

  // we dont want instant response because it will just waste cpu
  function searchButWithDelay(ms: number, search: () => Promise<RunnerResult[]>) {
    setResults([])
    setTimeout(() => {
      if (current === generation) {
        search().then(searchResults => {
          if (current === generation) setResults(searchResults)
        })
      }
    }, ms)
  }

  switch (input[0]) {
    case "=": return searchButWithDelay(80, () => searchRink(input.slice(1).trim()))
    case ":": return searchButWithDelay(300, () => translate(input.slice(1).trimStart(), RESULT_LIMIT))
    case ";": return setResults(searchSymbols(input.slice(1).trim(), RESULT_LIMIT))
    default: return setResults(searchApps(input, RESULT_LIMIT))
  }
}

function activateResult(index = selected()) {
  const result = results()[index]
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

// [index, index + length)
function moveSelection(amount: number) {
  const length = results().length
  if (length) setSelected(index => (index + amount + length) % length)
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

export function openRunner(next: Chooser | null = null) {
  chooser?.respond("")
  chooser = next
  const window = app.get_window("runner")!
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
      anchor={Astal.WindowAnchor.TOP}
      onKeyPressEvent={(_, event) => handleKeyPress(event.get_keyval()[1]) /* yes it does*/}>
      <box class="runner-shell" vertical>
        <box class={results.as(items => items.length > 0 ? "runner-input" : "runner-input empty")}>
          <icon icon="system-search-symbolic" pixelSize={20} />
          <entry
            hexpand
            placeholderText="Search applications"
            onChanged={self => updateRunner(self.text)}
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
                  <box vertical hexpand spacing={2} valign={Gtk.Align.CENTER}>
                    <label class="title" label={result.title} xalign={0} truncate />
                    <label
                      class="description"
                      label={result.description ?? ""}
                      xalign={0}
                      truncate
                      visible={Boolean(result.description)}
                    />
                  </box>
                </box>
              </button>
            )}
          </For>
        </box>
      </box>
    </window>
  )
}
