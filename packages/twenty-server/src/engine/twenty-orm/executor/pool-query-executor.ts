import { type Pool } from 'pg';

import { type CompiledStatement } from 'src/engine/twenty-orm/sql/utils/compile-named-parameters.util';
import { computeTwentyOrmException } from 'src/engine/twenty-orm/error-handling/compute-twenty-orm-exception.util';
import { type QueryExecutor } from 'src/engine/twenty-orm/executor/types/query-executor.type';

export class PoolQueryExecutor implements QueryExecutor {
  private readonly pool: Pool;

  constructor({ pool }: { pool: Pool }) {
    this.pool = pool;
  }

  async execute<TRow extends Record<string, unknown> = Record<string, unknown>>(
    statement: CompiledStatement,
  ): Promise<TRow[]> {
    try {
      const result = await this.pool.query<TRow>(statement);

      return result.rows;
    } catch (error) {
      throw computeTwentyOrmException(error);
    }
  }
}
