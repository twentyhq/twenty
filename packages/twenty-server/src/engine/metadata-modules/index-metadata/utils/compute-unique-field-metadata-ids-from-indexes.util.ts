type IndexLike = {
  isUnique: boolean;
  flatIndexFieldMetadatas?: Array<{
    fieldMetadataId: string;
    subFieldName: string | null;
  }>;
  indexFieldMetadatas?: Array<{
    fieldMetadataId: string;
    subFieldName: string | null;
  }>;
};

// A field is "unique" iff there exists a UNIQUE IndexMetadata whose single
// member is exactly that field (no composite sub-field). Centralized so the
// cache builder, REST controller, and any future consumer agree on the rule.
export const computeUniqueFieldMetadataIdsFromIndexes = (
  indexes: ReadonlyArray<IndexLike>,
): Set<string> => {
  const set = new Set<string>();

  for (const index of indexes) {
    if (!index.isUnique) continue;

    const fields = index.flatIndexFieldMetadatas ?? index.indexFieldMetadatas;

    if (fields?.length !== 1) continue;
    if (fields[0].subFieldName !== null) continue;

    set.add(fields[0].fieldMetadataId);
  }

  return set;
};
