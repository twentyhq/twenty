import { createHash } from 'crypto';

import { type Pool, type PoolClient } from 'pg';

import { type CompiledStatement } from 'src/engine/twenty-orm-v2/sql/utils/compile-named-parameters.util';
import { type QueryExecutorV2 } from 'src/engine/twenty-orm-v2/executor/types/query-executor-v2.type';

// A connection retains every named statement for its lifetime, so the set must be bounded.
const MAX_PREPARED_STATEMENT_SHAPES = 1000;

const statementNameByText = new Map<string, string>();

const buildStatementName = (text: string): string | undefined => {
  const existingName = statementNameByText.get(text);

  if (existingName !== undefined) {
    return existingName;
  }

  if (statementNameByText.size >= MAX_PREPARED_STATEMENT_SHAPES) {
    return undefined;
  }

  const name = `orm_v2_${createHash('sha1').update(text).digest('hex').slice(0, 24)}`;

  statementNameByText.set(text, name);

  return name;
};

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

    const statementName = buildStatementName(statement.text);

    const result = await queryable.query({
      ...(statementName === undefined ? {} : { name: statementName }),
      text: statement.text,
      values: statement.values,
    });

    return result.rows as Record<string, unknown>[];
  }
}
