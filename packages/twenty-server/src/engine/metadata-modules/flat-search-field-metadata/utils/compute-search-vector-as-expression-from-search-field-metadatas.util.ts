import { type FieldMetadataType } from 'twenty-shared/types';
import { isSearchableFieldType } from 'twenty-shared/utils';

import {
  type FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';

export type SearchVectorTargetField = {
  name: string;
  type: FieldMetadataType;
  createdAt: string;
  // Deterministic tie-break for fields sharing a createdAt (field metadata id when
  // resolved from the maps, universalIdentifier for fields not yet persisted).
  sortKey: string;
};

// Builds the searchVector to_tsvector asExpression from the fields targeted by an
// object's searchFieldMetadata rows. Callers MUST pass the POST-change field set
// (i.e. account for any row being added/removed in the same operation) rather than
// re-reading possibly-stale flat maps.
//
// Fields are filtered to searchable types and ordered deterministically by field
// metadata createdAt then sortKey. tsvector matching is order-insensitive so
// correctness never depends on order; the deterministic order only minimizes
// asExpression churn (standard objects keep their SEARCH_FIELDS_FOR_* row order).
export const computeSearchVectorAsExpressionFromSearchFieldMetadatas = (
  targetSearchableFields: SearchVectorTargetField[],
): string => {
  const orderedSearchableFields: FieldTypeAndNameMetadata[] = [
    ...targetSearchableFields,
  ]
    .sort((a, b) => {
      if (a.createdAt !== b.createdAt) {
        return a.createdAt < b.createdAt ? -1 : 1;
      }

      return a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0;
    })
    .flatMap((targetField) =>
      isSearchableFieldType(targetField.type)
        ? [{ name: targetField.name, type: targetField.type }]
        : [],
    );

  return getTsVectorColumnExpressionFromFields(orderedSearchableFields);
};
