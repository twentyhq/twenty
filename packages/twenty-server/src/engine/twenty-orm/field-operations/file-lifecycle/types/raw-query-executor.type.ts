// Bound to the repository's executor, so file changes commit or roll back with the record write.
export type RawQueryExecutor = (
  sql: string,
  parameters: unknown[],
) => Promise<Record<string, unknown>[]>;
