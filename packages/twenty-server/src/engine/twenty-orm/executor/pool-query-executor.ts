import { type Pool } from 'pg';

import { type CompiledStatement } from 'src/engine/twenty-orm/sql/utils/compile-named-parameters.util';
import { computeTwentyOrmException } from 'src/engine/twenty-orm/error-handling/compute-twenty-orm-exception.util';
import { type QueryExecutor } from 'src/engine/twenty-orm/executor/types/query-executor.type';

export class PoolQueryExecutor implements QueryExecutor {
  private readonly pool: Pool;

  constructor({ pool }: { pool: Pool }) {
    this.pool = pool;
  }

  async execute(
    statement: CompiledStatement,
  ): Promise<Record<string, unknown>[]> {
    try {
      const result = await this.pool.query({
        text: statement.text,
        values: statement.values,
      });

      return result.rows as Record<string, unknown>[];
    } catch (error) {
      throw computeTwentyOrmException(error);
    }
  }
}
