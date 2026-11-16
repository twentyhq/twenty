import { type FieldMetadataComputationBindings } from '@/types/FieldMetadataComputationBindings';
import { type OrderBy } from '@/types/OrderBy';

// The field is a one-to-many relation showing a subset of another one-to-many relation.
// `filter`, `orderBy` and `limit` decide its records; each sort expression is evaluated on a related record.
export type FieldMetadataFilteredRelationComputation = {
  kind: 'FILTERED_RELATION';
  relationFieldName: string;
  filter?: string;
  orderBy?: { expression: string; direction: OrderBy }[];
  limit?: number;
  bindings?: FieldMetadataComputationBindings;
};
