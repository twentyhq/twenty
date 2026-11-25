import { type Pool } from 'pg';

import { type CompiledStatement } from 'src/engine/workspace-query-executor/utils/compile-named-parameters.util';
import { computeWorkspaceQueryExecutorException } from 'src/engine/workspace-query-executor/error-handling/compute-workspace-query-executor-exception.util';
import { type QueryExecutor } from 'src/engine/workspace-query-executor/types/query-executor.type';

export class PoolQueryExecutor implements QueryExecutor {
  private readonly pool: Pick<Pool, 'query'>;

  constructor({ pool }: { pool: Pick<Pool, 'query'> }) {
    this.pool = pool;
  }

  async execute(
    statement: CompiledStatement,
  ): Promise<Record<string, unknown>[]> {
    try {
      const result = await this.pool.query(statement);

      return result.rows as Record<string, unknown>[];
    } catch (error) {
      throw computeWorkspaceQueryExecutorException(error);
    }
  }
}
