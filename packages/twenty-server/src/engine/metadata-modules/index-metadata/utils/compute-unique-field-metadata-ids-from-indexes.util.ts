type IndexLike = {
  isUnique: boolean;
  isSystemSideEffect: boolean;
  flatIndexFieldMetadatas?: Array<{
    fieldMetadataId: string;
    subFieldName: string | null;
  }>;
  indexFieldMetadatas?: Array<{
    fieldMetadataId: string;
    subFieldName: string | null;
  }>;
};

// A field is "unique" iff a UNIQUE IndexMetadata that the engine owns as the
// field's backing constraint (isSystemSideEffect) has exactly that field as its
// single member (no composite sub-field).
//
// The isSystemSideEffect guard is what keeps `field.isUnique` symmetric between
// the app-sync "from" side (this derivation, over the workspace cache) and the
// "to" side (the field-level flag on the manifest). A user-declared custom
// UNIQUE index — e.g. `defineIndex({ isUnique: true, fields: [oneField] })` —
// is isSystemSideEffect: false: it enforces uniqueness at the DB level but is
// not the field's backing constraint, so it must NOT flip `field.isUnique`.
// Counting it would make the cache report `true` while the manifest field
// reports `false`, producing a phantom `[isUnique] changed` diff that reapplies
// on every sync and never converges. Excluding it also stops the create/update
// side-effect from generating a second, duplicate backing index for a field
// whose uniqueness the custom index already provides.
//
// Centralized so the cache builder, REST controller, and any future consumer
// agree on the rule.
export const computeUniqueFieldMetadataIdsFromIndexes = (
  indexes: ReadonlyArray<IndexLike>,
): Set<string> => {
  const set = new Set<string>();

  for (const index of indexes) {
    if (!index.isUnique) continue;
    if (!index.isSystemSideEffect) continue;

    const fields = index.flatIndexFieldMetadatas ?? index.indexFieldMetadatas;

    if (fields?.length !== 1) continue;
    if (fields[0].subFieldName !== null) continue;

    set.add(fields[0].fieldMetadataId);
  }

  return set;
};
