const boundary = /[\s_\-./]/
// extra pts of start of str, or after:
//     whitespace (duh)
// _
// .
// -   for kebab case
// /

export function fuzzyScore(candidate: string, query: string): number | null {
  if (!query) return 0

  const caseSensitive = query !== query.toLowerCase()
  const haystack = caseSensitive ? candidate : candidate.toLowerCase()
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
