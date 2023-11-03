import console from 'console';

import { connectionSource, performQuery } from './utils';

const getWorkspacesFromSchema = async () => {
  return await performQuery(
    `
        SELECT nspname FROM pg_catalog.pg_namespace 
        WHERE nspname LIKE 'workspace_twenty%';
      `,
    'List workspaces',
  );
};

const getTables = async (workspace?) => {
  return await performQuery(
    `
            select * from pg_tables where schemaname='${
              workspace ? workspace.nspname : 'public'
            }';
        `,
    'List tables',
  );
};
const getMaxUpdatedAt = async (table) => {
  return await performQuery(
    `
          select MAX("updatedAt") from ${table.schemaname}."${table.tablename}";
      `,
    `Get max updatedAt from table ${table}`,
    false,
  );
};

const logMaxUpdatedAtFromWorkspaceSchema = async () => {
  const workspaces = await getWorkspacesFromSchema();
  for (const workspace of workspaces) {
    const tables = await getTables(workspace);
    let greaterUpdatedAt;
    for (const table of tables) {
      const maxUpdatedAt = await getMaxUpdatedAt(table);
      if (
        maxUpdatedAt[0].max &&
        (!greaterUpdatedAt || greaterUpdatedAt < new Date(maxUpdatedAt[0].max))
      ) {
        greaterUpdatedAt = maxUpdatedAt[0].max;
      }
    }
    console.log('greaterUpdatedAt for ', workspace.nspname, greaterUpdatedAt);
  }
};

const logMaxUpdatedAtFromPublicSchema = async () => {
  const workspaces = await performQuery(
    `
    SELECT id FROM workspaces;
    `,
    'List public workspaces',
  );
  const tables = await getTables();
  for (const workspace of workspaces) {
    let greaterUpdatedAt;
    for (const table of tables) {
      const maxUpdatedAt = await performQuery(
        `
        SELECT MAX("updatedAt") FROM ${table.tablename}
        WHERE "workspaceId"='${workspace.id}'
      `,
        'Get List of tables',
        false,
      );
      if (
        maxUpdatedAt &&
        maxUpdatedAt[0].max &&
        (!greaterUpdatedAt || greaterUpdatedAt < new Date(maxUpdatedAt[0].max))
      ) {
        greaterUpdatedAt = maxUpdatedAt[0].max;
      }
    }
    console.log('greaterUpdatedAt', workspace.id, greaterUpdatedAt);
  }
};
connectionSource
  .initialize()
  .then(async () => {
    await logMaxUpdatedAtFromWorkspaceSchema();
    await logMaxUpdatedAtFromPublicSchema();
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });
