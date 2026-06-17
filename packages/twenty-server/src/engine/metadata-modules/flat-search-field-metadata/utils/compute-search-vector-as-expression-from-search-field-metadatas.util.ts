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
  // Tie-break for fields sharing a createdAt (field id, or universalIdentifier when
  // not yet persisted).
  sortKey: string;
};

export const buildSearchVectorTargetField = (
  field: { name: string; type: FieldMetadataType; createdAt: string },
  sortKey: string,
): SearchVectorTargetField => ({
  name: field.name,
  type: field.type,
  createdAt: field.createdAt,
  sortKey,
});

// Builds the searchVector to_tsvector asExpression from an object's targeted fields.
// Callers MUST pass the POST-change field set (account for rows added/removed in the
// same operation), not re-read stale maps. Ordering is deterministic only to minimize
// asExpression churn — tsvector matching is order-insensitive.
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
