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

// Fields are referenced by name, as in an API query, so a computation reads the same in every workspace
export type FieldMetadataComputation =
  | FieldMetadataFormulaComputation
  | FieldMetadataRollupComputation;
