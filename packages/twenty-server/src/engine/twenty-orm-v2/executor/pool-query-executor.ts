import { type Pool } from 'pg';

import { type CompiledStatement } from 'src/engine/twenty-orm-v2/sql/utils/compile-named-parameters.util';
import { type QueryExecutorV2 } from 'src/engine/twenty-orm-v2/executor/types/query-executor-v2.type';

export class PoolQueryExecutor implements QueryExecutorV2 {
  private readonly pool: Pool;

  constructor({ pool }: { pool: Pool }) {
    this.pool = pool;
  }

  async execute(
    statement: CompiledStatement,
  ): Promise<Record<string, unknown>[]> {
    const result = await this.pool.query({
      text: statement.text,
      values: statement.values,
    });

    return result.rows as Record<string, unknown>[];
  }
}
