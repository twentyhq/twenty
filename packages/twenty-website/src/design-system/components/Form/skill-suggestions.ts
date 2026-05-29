// Pure filter for the TagInput autocomplete: suggestions in `pool` that match
// `query` (case-insensitive substring) and are not already in `selected`.
export function filterSkillSuggestions(
  pool: ReadonlyArray<string>,
  selected: ReadonlyArray<string>,
  query: string,
): string[] {
  const trimmed = query.trim().toLowerCase();
  if (trimmed === '') return [];
  const taken = new Set(selected.map((value) => value.toLowerCase()));
  return pool.filter(
    (value) =>
      !taken.has(value.toLowerCase()) && value.toLowerCase().includes(trimmed),
  );
}
