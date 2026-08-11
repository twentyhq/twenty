import { createHash } from 'crypto';

import { type Pool, type PoolClient } from 'pg';

import { type CompiledStatement } from 'src/engine/twenty-orm-v2/sql/utils/compile-named-parameters.util';
import { type QueryExecutorV2 } from 'src/engine/twenty-orm-v2/executor/types/query-executor-v2.type';

// pg turns a query carrying a `name` into a server-side prepared statement: parsed and
// planned once per connection, then bound and executed. Query text is generated from
// metadata and so repeats across requests, which is exactly the shape that benefits.
const buildStatementName = (text: string): string =>
  `orm_v2_${createHash('sha1').update(text).digest('hex').slice(0, 24)}`;

export class PreparedStatementExecutor implements QueryExecutorV2 {
  private readonly pool: Pool;
  private readonly client?: PoolClient;

  constructor({ pool, client }: { pool: Pool; client?: PoolClient }) {
    this.pool = pool;
    this.client = client;
  }

  async execute(
    statement: CompiledStatement,
  ): Promise<Record<string, unknown>[]> {
    const queryable = this.client ?? this.pool;

    const result = await queryable.query({
      name: buildStatementName(statement.text),
      text: statement.text,
      values: statement.values,
    });

    return result.rows as Record<string, unknown>[];
  }
}
