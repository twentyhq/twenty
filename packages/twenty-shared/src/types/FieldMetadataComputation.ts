import { type OrderBy } from '@/types/OrderBy';

export const FIELD_METADATA_ROLLUP_OPERATIONS = [
  'COUNT',
  'SUM',
  'AVG',
  'MIN',
  'MAX',
] as const;

export type FieldMetadataRollupOperation =
  (typeof FIELD_METADATA_ROLLUP_OPERATIONS)[number];

export type FieldMetadataFormulaComputation = {
  kind: 'FORMULA';
  expression: string;
};

// `expression` and `filter` are evaluated on each related record; COUNT takes no expression
export type FieldMetadataRollupComputation = {
  kind: 'ROLLUP';
  relationFieldName: string;
  operation: FieldMetadataRollupOperation;
  expression?: string;
  filter?: string;
};

// The field is a one-to-many relation showing a subset of another one-to-many relation
export type FieldMetadataFilteredRelationComputation = {
  kind: 'FILTERED_RELATION';
  relationFieldName: string;
  filter?: string;
  // Each entry sorts by one field of the related records, named as in an expression
  orderBy?: Record<string, OrderBy>[];
  limit?: number;
};

// Fields are referenced by name, as in an API query, so a computation reads the same in every workspace
export type FieldMetadataComputation =
  | FieldMetadataFormulaComputation
  | FieldMetadataRollupComputation
  | FieldMetadataFilteredRelationComputation;
