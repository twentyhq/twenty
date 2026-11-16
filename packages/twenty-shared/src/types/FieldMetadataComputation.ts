export const FIELD_METADATA_ROLLUP_OPERATIONS = [
  'COUNT',
  'SUM',
  'AVG',
  'MIN',
  'MAX',
] as const;

export type FieldMetadataRollupOperation =
  (typeof FIELD_METADATA_ROLLUP_OPERATIONS)[number];

// The value of the field is an expression over the record's own fields
export type FieldMetadataFormulaComputation = {
  kind: 'FORMULA';
  expression: string;
};

// The value of the field aggregates the records of a one-to-many relation.
// `expression` and `filter` are evaluated on each related record; COUNT takes no expression.
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
