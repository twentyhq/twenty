// QUERY_TIME formulas are computed in SQL on every read, STORED ones are written to the column
export type FieldMetadataFormulaEvaluation = 'QUERY_TIME' | 'STORED';
