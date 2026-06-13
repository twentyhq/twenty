// Appends a skill to the list: trims it, and ignores blanks and exact
// duplicates. Returns a new array so the reducer/state update stays immutable.
export function addSkill(values: readonly string[], raw: string): string[] {
  const skill = raw.trim();
  if (skill === '' || values.includes(skill)) return [...values];
  return [...values, skill];
}
