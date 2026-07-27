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

const PAGE_SIZE = 8
const [page, setPage] = createState<{ offset: number; results: RunnerResult[] }>({ offset: 0, results: [] })
const visibleResults = page.as(page => page.results.slice(0, PAGE_SIZE))
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

async function updateRunner(input: string, target?: { offset: number; selected: number }) {
  const current = ++generation
  const offset = target?.offset ?? 0
  const limit = PAGE_SIZE + 1 // extra row means another page exists
  let results: RunnerResult[]

  // the paging here is so that spammed unicode search doesnt obliterate our CPU

  if (chooser) {
    results = queryLines(chooser.lines, input, offset, limit)
  } else if (!input.trim()) {
    results = []
  } else {
    switch (input[0]) {
      case "=":
      case ":":
        setPage({ offset, results: [] })
        if (!target) {
          await new Promise<void>(resolve => setTimeout(resolve, input[0] === "=" ? 80 : 300))
          if (current !== generation) return
        }
        results = input[0] === "="
          ? await searchRink(input.slice(1).trim())
          : await translate(input.slice(1).trimStart(), offset, limit)
        if (current !== generation) return
        break
      case ";":
        results = searchSymbols(input.slice(1).trim(), offset, limit)
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
                placeholderText="Search applications"
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
        </eventbox>
      </eventbox>
    </window>
  )
}
