// invertBooleanValues: deprecated aliases like isUIReadOnly filter against the opposite isUIEditable column
export type MetadataFilterColumn =
  | { column: string; type: 'uuid' }
  | { column: string; type: 'boolean'; invertBooleanValues?: true };
