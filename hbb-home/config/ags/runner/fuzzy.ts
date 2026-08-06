const boundary = /[\s_\-./]/
// extra pts of start of str, or after:
//     whitespace (duh)
// _
// .
// -   for kebab case
// /

// range is (-inf, inf) so consider -Infinity
export function fuzzyScore(candidate: string, query: string, candidateIsLowercase = false): number | null {
  if (!query) return 0

  const caseSensitive = query !== query.toLowerCase()
  const haystack = caseSensitive || candidateIsLowercase ? candidate : candidate.toLowerCase()
  const needle = caseSensitive ? query : query.toLowerCase()

  let score = 0, pos = 0, prev = -2

  for (let i = 0; i < needle.length; i++) {
    const index = haystack.indexOf(needle[i], pos)
    if (index < 0) return null

    if (index === prev + 1) // doesnt wrongly bonus at start cuz prev = -2
      score += 10 // consecutive match bonus

    if (index === 0 || boundary.test(haystack[index - 1]))
      score += 8 // boundary match bonus

    score -= index - pos // skipped chars penalty (since we jump)
    prev = index
    pos = index + 1
  }

  return score - candidate.length * 0.1 // debuff massive strings but not too much
}

type EntryScorePair<T> = { entry: T; score: number }

export function topKScorers<T>(
  entries: readonly T[],
  getScore: (entry: T) => number | null,
  k: number,
): EntryScorePair<T>[] {
  const best: EntryScorePair<T>[] = []

  for (const entry of entries) {
    const score = getScore(entry)
    if (score === null) continue // e.g. fuzzyScore returns null

    const position = best.findIndex(result => score > result.score)
    if (position < 0) {
      if (best.length < k) best.push({ entry, score })
    } else {
      best.splice(position, 0, { entry, score })
      if (best.length > k) best.pop()
    }
  }

  return best
}
