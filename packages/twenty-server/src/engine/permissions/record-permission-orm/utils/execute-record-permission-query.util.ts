/* @license Enterprise */

import { type QueryExecutor } from 'src/engine/twenty-orm/executor/types/query-executor.type';
import {
  compileNamedParameters,
  type NamedParameters,
} from 'src/engine/twenty-orm/sql/utils/compile-named-parameters.util';

export const executeRecordPermissionQuery = <
  TRow extends Record<string, unknown>,
>({
  executor,
  sql,
  parameters,
}: {
  executor: QueryExecutor;
  sql: string;
  parameters: NamedParameters;
}): Promise<TRow[]> =>
  executor.execute<TRow>(compileNamedParameters(sql, parameters));
