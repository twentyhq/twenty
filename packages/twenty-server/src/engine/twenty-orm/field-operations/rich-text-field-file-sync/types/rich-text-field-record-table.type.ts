export type RichTextFieldRecordTable = {
  tableExpression: string;
  executeRawQuery: (
    sql: string,
    parameters: unknown[],
  ) => Promise<Record<string, unknown>[]>;
};
