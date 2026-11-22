export const findWorkspaceTableShape = async ({
  schemaName,
  tableName,
}: {
  schemaName: string;
  tableName: string;
}) => {
  const columns: {
    column_name: string;
    udt_name: string;
    is_nullable: string;
    is_identity: string;
    column_default: string | null;
  }[] = await global.testDataSource.query(
    `SELECT column_name, udt_name, is_nullable, is_identity,
       replace(column_default, $1, 'schema') AS column_default
     FROM information_schema.columns
     WHERE table_schema = $1 AND table_name = $2
     ORDER BY column_name`,
    [schemaName, tableName],
  );
  const indexes: { indexname: string; indexdef: string }[] =
    await global.testDataSource.query(
      `SELECT indexname, replace(indexdef, $1, 'schema') AS indexdef
       FROM pg_indexes WHERE schemaname = $1 AND tablename = $2
       ORDER BY indexname`,
      [schemaName, tableName],
    );
  const constraints: { conname: string; definition: string }[] =
    await global.testDataSource.query(
      `SELECT conname, replace(pg_get_constraintdef(oid), $1, 'schema') AS definition
       FROM pg_constraint
       WHERE conrelid = (quote_ident($1) || '.' || quote_ident($2))::regclass
       ORDER BY conname`,
      [schemaName, tableName],
    );

  return { columns, indexes, constraints };
};
