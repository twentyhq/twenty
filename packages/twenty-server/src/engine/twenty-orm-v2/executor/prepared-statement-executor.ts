import { createHash } from 'crypto';

import { Logger } from '@nestjs/common';

import { type Pool } from 'pg';

import { type CompiledStatement } from 'src/engine/twenty-orm-v2/sql/utils/compile-named-parameters.util';
import { type QueryExecutorV2 } from 'src/engine/twenty-orm-v2/executor/types/query-executor-v2.type';

const MAX_PREPARED_STATEMENT_SHAPES_PER_WORKSPACE = 200;
const MAX_TRACKED_WORKSPACES = 100;

const logger = new Logger('PreparedStatementExecutor');

// Statement text embeds the workspace schema, so shapes never cross tenants. The budget is
// scoped the same way, otherwise one busy workspace exhausts a shared budget and every
// other tenant silently falls back to unnamed statements. The number of tracked workspaces
// is capped in turn, so tenant churn cannot grow this without bound: entries are held in
// least-recently-used order and the coldest workspace is dropped once the cap is reached.
const statementNamesByWorkspaceId = new Map<string, Map<string, string>>();

const saturatedWorkspaceIds = new Set<string>();

const getStatementNameByText = (workspaceId: string): Map<string, string> => {
  const existing = statementNamesByWorkspaceId.get(workspaceId);

  if (existing !== undefined) {
    statementNamesByWorkspaceId.delete(workspaceId);
    statementNamesByWorkspaceId.set(workspaceId, existing);

    return existing;
  }

  const statementNameByText = new Map<string, string>();

  statementNamesByWorkspaceId.set(workspaceId, statementNameByText);

  while (statementNamesByWorkspaceId.size > MAX_TRACKED_WORKSPACES) {
    const coldestWorkspaceId = statementNamesByWorkspaceId.keys().next().value;

    if (coldestWorkspaceId === undefined) {
      break;
    }

    statementNamesByWorkspaceId.delete(coldestWorkspaceId);
    saturatedWorkspaceIds.delete(coldestWorkspaceId);
  }

  return statementNameByText;
};

const buildStatementName = (
  workspaceId: string,
  text: string,
): string | undefined => {
  const statementNameByText = getStatementNameByText(workspaceId);
  const existingName = statementNameByText.get(text);

  if (existingName !== undefined) {
    return existingName;
  }

  if (statementNameByText.size >= MAX_PREPARED_STATEMENT_SHAPES_PER_WORKSPACE) {
    if (!saturatedWorkspaceIds.has(workspaceId)) {
      saturatedWorkspaceIds.add(workspaceId);
      logger.warn(
        `Workspace ${workspaceId} reached ${MAX_PREPARED_STATEMENT_SHAPES_PER_WORKSPACE} prepared statement shapes; further shapes run unnamed`,
      );
    }

    return undefined;
  }

  const name = `orm_v2_${createHash('sha1').update(text).digest('hex').slice(0, 24)}`;

  statementNameByText.set(text, name);

  return name;
};

export class PreparedStatementExecutor implements QueryExecutorV2 {
  private readonly pool: Pool;
  private readonly workspaceId: string;

  constructor({ pool, workspaceId }: { pool: Pool; workspaceId: string }) {
    this.pool = pool;
    this.workspaceId = workspaceId;
  }

  async execute(
    statement: CompiledStatement,
  ): Promise<Record<string, unknown>[]> {
    const statementName = buildStatementName(this.workspaceId, statement.text);

    const result = await this.pool.query({
      ...(statementName === undefined ? {} : { name: statementName }),
      text: statement.text,
      values: statement.values,
    });

    return result.rows as Record<string, unknown>[];
  }
}
