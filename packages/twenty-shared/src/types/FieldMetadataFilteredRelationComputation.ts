import { type FieldMetadataComputationBindings } from '@/types/FieldMetadataComputationBindings';
import { type OrderBy } from '@/types/OrderBy';

// The field is a one-to-many relation showing a subset of another one-to-many relation
export type FieldMetadataFilteredRelationComputation = {
  kind: 'FILTERED_RELATION';
  relationFieldName: string;
  filter?: string;
  // Each entry sorts by one field of the related records, named as in an expression
  orderBy?: Record<string, OrderBy>[];
  limit?: number;
  bindings?: FieldMetadataComputationBindings;
};
