import { type Pool } from 'pg';

import { type CompiledStatement } from 'src/engine/twenty-orm/sql/utils/compile-named-parameters.util';
import { computeTwentyOrmException } from 'src/engine/twenty-orm/error-handling/compute-twenty-orm-exception.util';
import { type QueryExecutor } from 'src/engine/twenty-orm/executor/types/query-executor.type';
import { runWithRecordPermissionBudget } from 'src/engine/twenty-orm/datasource/utils/run-with-record-permission-budget.util';

export class PoolQueryExecutor implements QueryExecutor {
  private readonly pool: Pool;
  private readonly permissionWorkspaceId?: string;

  constructor({
    pool,
    permissionWorkspaceId,
  }: {
    pool: Pool;
    permissionWorkspaceId?: string;
  }) {
    this.pool = pool;
    this.permissionWorkspaceId = permissionWorkspaceId;
  }

  async execute(
    statement: CompiledStatement,
  ): Promise<Record<string, unknown>[]> {
    try {
      const result = this.permissionWorkspaceId
        ? await runWithRecordPermissionBudget({
            pool: this.pool,
            workspaceId: this.permissionWorkspaceId,
            work: (client) => client.query(statement),
          })
        : await this.pool.query(statement);

      return result.rows as Record<string, unknown>[];
    } catch (error) {
      throw computeTwentyOrmException(error);
    }
  }
}
