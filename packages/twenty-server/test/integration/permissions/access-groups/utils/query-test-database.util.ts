export const queryTestDatabase = async <TRow>({
  sql,
  parameters = [],
}: {
  sql: string;
  parameters?: unknown[];
}): Promise<TRow[]> => {
  const rows: TRow[] = await global.testDataSource.query(sql, parameters);

  return rows;
};
