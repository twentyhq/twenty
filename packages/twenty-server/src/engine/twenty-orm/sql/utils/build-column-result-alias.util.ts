import { buildPostgresSafeAlias } from 'src/engine/workspace-query-executor/utils/build-postgres-safe-alias.util';

export const buildColumnResultAlias = (
  alias: string,
  columnName: string,
): string => buildPostgresSafeAlias(`${alias}_${columnName}`);
