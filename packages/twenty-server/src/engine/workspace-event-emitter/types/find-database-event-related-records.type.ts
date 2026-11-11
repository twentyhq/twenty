export type FindDatabaseEventRelatedRecords = (args: {
  relationFieldName: string;
  recordIds: string[];
  fieldNames: string[];
}) => Promise<Record<string, unknown>[]>;
