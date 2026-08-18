// invertBooleanValues supports deprecated boolean aliases whose backing
// column has the opposite meaning (isUIReadOnly filters run against
// isUIEditable, since the legacy column is no longer written).
export type MetadataFilterColumn =
  | { column: string; type: 'uuid' }
  | { column: string; type: 'boolean'; invertBooleanValues?: true };
