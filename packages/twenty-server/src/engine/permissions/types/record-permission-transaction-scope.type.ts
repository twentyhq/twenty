export type RecordPermissionTransactionScope = {
  workspaceId: string;
  executeRawQuery: (
    sql: string,
    parameters?: unknown[],
  ) => Promise<Record<string, unknown>[]>;
};
