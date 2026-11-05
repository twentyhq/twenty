import { type PoolClient } from 'pg';

import { type CompiledStatement } from 'src/engine/workspace-query-executor/utils/compile-named-parameters.util';
import { computeTwentyOrmException } from 'src/engine/twenty-orm/error-handling/compute-twenty-orm-exception.util';
import { type QueryExecutor } from 'src/engine/workspace-query-executor/types/query-executor.type';

export class ClientQueryExecutor implements QueryExecutor {
  private readonly client: PoolClient;

  constructor({ client }: { client: PoolClient }) {
    this.client = client;
  }

  async execute<TRow extends Record<string, unknown> = Record<string, unknown>>(
    statement: CompiledStatement,
  ): Promise<TRow[]> {
    try {
      const result = await this.client.query<TRow>(statement);

      return result.rows;
    } catch (error) {
      throw computeTwentyOrmException(error);
    }
  }
}
