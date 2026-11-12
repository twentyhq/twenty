export type FindDatabaseEventRelatedRecordsResult =
  | { relatedRecords: Record<string, unknown>[] }
  | { errorMessage: string };

export type FindDatabaseEventRelatedRecords = (args: {
  relationFieldName: string;
  recordIds: string[];
  fieldNames: string[];
}) => Promise<FindDatabaseEventRelatedRecordsResult>;
