// Captures each option's literal `value` into the returned type without
// `as const`: a call site lists its options once, and the value union derives
// from the result via `(typeof OPTIONS)[number]['value']`. The option shape is
// inferred per field, so an option set can carry extra fields (a scope card's
// description/examples) without a separate type.
export function defineFieldOptions<const TOption extends { value: string }>(
  options: readonly TOption[],
): readonly TOption[] {
  return options;
}
