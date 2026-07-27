export type ResultAction =
  // launch and dismiss
  | { kind: "launch"; run: () => void | Promise<void> }
  // copy and dismiss
  | { kind: "copy"; text: string }
  // emit to stdin caller and dismiss
  | { kind: "return"; text: string }

export type RunnerResult = {
  title: string
  description?: string
  icon?: string
  action: ResultAction
}

export type Provider = {
  debounceMs?: number
  /** Returns the provider query, or null when this provider is inactive. */
  matchInput: (input: string) => string | null
  /** Returns up to `limit` ranked results, starting at `offset`. */
  query: (input: string, limit: number, offset?: number) => RunnerResult[] | Promise<RunnerResult[]>
}
