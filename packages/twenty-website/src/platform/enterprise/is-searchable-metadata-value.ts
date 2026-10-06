const SEARCHABLE_METADATA_VALUE_PATTERN = /^[A-Za-z0-9_.:-]{1,128}$/;

export function isSearchableMetadataValue(value: unknown): value is string {
  return (
    typeof value === 'string' && SEARCHABLE_METADATA_VALUE_PATTERN.test(value)
  );
}
