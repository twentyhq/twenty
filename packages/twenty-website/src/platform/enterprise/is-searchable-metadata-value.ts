// Values reach Stripe's search query language by interpolation, so they are
// restricted to characters that cannot terminate or extend a clause. Quotes,
// spaces and backslashes are the ones that would.
const SEARCHABLE_METADATA_VALUE_PATTERN = /^[A-Za-z0-9_.:-]{1,128}$/;

export function isSearchableMetadataValue(value: unknown): value is string {
  return (
    typeof value === 'string' && SEARCHABLE_METADATA_VALUE_PATTERN.test(value)
  );
}
