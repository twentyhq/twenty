type FieldWithId = {
  id: string;
};

// Convenience constructor for the resolver expected by
// computeRecordGqlOperationFilter / turnRecordFilterIntoRecordGqlOperationFilter.
// Callers with an array of field metadata items can hand it directly; the
// resolver then handles both source-field and relation-target-field lookups
// in a single lookup map (O(1) per call).
export const createFindFieldMetadataItemById = <T extends FieldWithId>(
  fields: T[],
): ((id: string) => T | undefined) => {
  const fieldById = new Map(fields.map((field) => [field.id, field]));

  return (id) => fieldById.get(id);
};
