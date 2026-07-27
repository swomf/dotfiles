import app from "ags/gtk3/app"
import { Astal } from "ags/gtk3"
import { execAsync } from "ags/process"
import { createState, For } from "ags"
import GLib from "gi://GLib?version=2.0"
import Gdk from "gi://Gdk?version=3.0"
import Gtk from "gi://Gtk?version=3.0"
import { appProvider } from "./providers/apps"
import { rinkProvider } from "./providers/rink"
import { queryLines } from "./providers/stdin"
import { symbolProvider } from "./providers/symbols"
import { translateProvider } from "./providers/translate"
import type { Provider, RunnerResult } from "./types"

const providers: Provider[] = [appProvider, rinkProvider, symbolProvider, translateProvider]
const RESULT_LIMIT = 8
const [results, setResults] = createState<RunnerResult[]>([])
const [selected, setSelected] = createState(0)
const [prompt] = createState("Search applications")

let entry: Gtk.Entry
let generation = 0
let stdinLines: string[] | null = null
let stdinResponse: ((value: string) => void) | null = null

function dismissRunner(value = "") {
  generation++
  const response = stdinResponse
  stdinLines = null
  stdinResponse = null
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
  if (stdinLines) {
    setResults(queryLines(stdinLines, input))
    return
  }
  // dont rank if textbox input empty
  if (!input.trim()) {
    setResults([])
    return
  }

  const active = providers
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

  const next = await active.provider.query(active.query, RESULT_LIMIT)
  if (current === generation)
    setResults(next)
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

export function openRunner() {
  stdinLines = null
  stdinResponse = null
  presentRunner()
}

export function openStdin(lines: string[], response: (value: string) => void) {
  if (stdinResponse) stdinResponse("")
  stdinLines = lines
  stdinResponse = response
  presentRunner()
}

function presentRunner() {
  const window = app.get_window("runner")!
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
  const { TOP } = Astal.WindowAnchor

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
      anchor={TOP}
      onKeyPressEvent={(_, event) => handleKeyPress(event.get_keyval()[1]) /* yes it does*/}>
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
