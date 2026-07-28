const boundary = /[\s_\-./]/
// extra pts of start of str, or after:
//     whitespace (duh)
// _
// .
// -   for kebab case
// /

// candidateIsLowercase is a small optimization to avoid a copy
// in case we already know that the haystack is lowercase (e.g. emoji search)
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

export type ScoredMatch<T> = { entry: T; index: number; score: number }

export function topMatches<T>(
  entries: Iterable<T>,
  scoreEntry: (entry: T, index: number) => number | null,
  needed: number,
): ScoredMatch<T>[] {
  const best: ScoredMatch<T>[] = []
  if (needed <= 0) return best

  let index = 0
  for (const entry of entries) {
    const score = scoreEntry(entry, index)
    if (score !== null) {
      const position = best.findIndex(result =>
        score > result.score || (score === result.score && index < result.index))
      if (position < 0) {
        if (best.length < needed) best.push({ entry, index, score })
      } else {
        best.splice(position, 0, { entry, index, score })
        if (best.length > needed) best.pop()
      }
    }
    index++
  }

  return best
}
