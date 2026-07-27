
export type RunnerResult = {
  title: string
  description?: string
  icon?: string
  action: { kind: "launch"; run: () => boolean }
  | { kind: "copy"; text: string } // copy to clipboard
  | { kind: "return"; text: string } // return a value to something, e.g. choose
}
