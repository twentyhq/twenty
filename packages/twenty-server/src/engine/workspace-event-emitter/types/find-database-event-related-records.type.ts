// Loads the records a relation points to, with only the fields a condition reads
export type FindDatabaseEventRelatedRecords = (args: {
  relationFieldName: string;
  recordIds: string[];
  fieldNames: string[];
}) => Promise<Record<string, unknown>[]>;
