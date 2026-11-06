import { type PoolClient } from 'pg';

import { type CompiledStatement } from 'src/engine/workspace-query-executor/utils/compile-named-parameters.util';
import { computeWorkspaceQueryExecutorException } from 'src/engine/workspace-query-executor/error-handling/compute-workspace-query-executor-exception.util';
import { type QueryExecutor } from 'src/engine/workspace-query-executor/types/query-executor.type';

export class ClientQueryExecutor implements QueryExecutor {
  private readonly client: PoolClient;

  constructor({ client }: { client: PoolClient }) {
    this.client = client;
  }

  async execute(
    statement: CompiledStatement,
  ): Promise<Record<string, unknown>[]> {
    try {
      const result = await this.client.query(statement);

      return result.rows as Record<string, unknown>[];
    } catch (error) {
      throw computeWorkspaceQueryExecutorException(error);
    }
  }
}
