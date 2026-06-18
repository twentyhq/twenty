// Appends a tag to the list: trims it, and ignores blanks and exact
// duplicates. Returns a new array so the caller's state update stays immutable.
export function addTag(values: readonly string[], raw: string): string[] {
  const tag = raw.trim();
  if (tag === '' || values.includes(tag)) return [...values];
  return [...values, tag];
}
