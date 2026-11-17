import { type FieldMetadataComputationBindings } from '@/types/FieldMetadataComputationBindings';
import { type OrderBy } from '@/types/OrderBy';

// A one-to-many subset of another one-to-many relation; sort expressions are evaluated on the related record
export type FieldMetadataFilteredRelationComputation = {
  kind: 'FILTERED_RELATION';
  relationFieldName: string;
  filter?: string;
  orderBy?: { expression: string; direction: OrderBy }[];
  limit?: number;
  bindings?: FieldMetadataComputationBindings;
};
