import { type PoolClient } from 'pg';

import { type CompiledStatement } from 'src/engine/twenty-orm-v2/sql/utils/compile-named-parameters.util';
import { type QueryExecutorV2 } from 'src/engine/twenty-orm-v2/executor/types/query-executor-v2.type';

export class ClientQueryExecutor implements QueryExecutorV2 {
  private readonly client: PoolClient;

  constructor({ client }: { client: PoolClient }) {
    this.client = client;
  }

  async execute(
    statement: CompiledStatement,
  ): Promise<Record<string, unknown>[]> {
    const result = await this.client.query({
      text: statement.text,
      values: statement.values,
    });

    return result.rows as Record<string, unknown>[];
  }
}
