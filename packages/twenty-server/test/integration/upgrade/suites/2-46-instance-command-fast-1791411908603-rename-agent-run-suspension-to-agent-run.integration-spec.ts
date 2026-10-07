import { type QueryRunner } from 'typeorm';
import { v4 } from 'uuid';

import { RenameAgentRunSuspensionToAgentRunFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-instance-command-fast-1791411908603-rename-agent-run-suspension-to-agent-run';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

jest.useRealTimers();

const CALLER = JSON.stringify({
  type: 'WORKFLOW_STEP',
  ref: { workflowRunId: v4(), stepId: 'step' },
});

describe('2-46 fast instance command 1791411908603 - RenameAgentRunSuspensionToAgentRunFastInstanceCommand (integration)', () => {
  const command = new RenameAgentRunSuspensionToAgentRunFastInstanceCommand();
  let queryRunner: QueryRunner;

  const insertRun = (threadId: string, status: string) =>
    queryRunner.query(
      `INSERT INTO "core"."agentRun" ("workspaceId", "threadId", caller, status)
       VALUES ($1, $2, $3::jsonb, $4) RETURNING id`,
      [SEED_APPLE_WORKSPACE_ID, threadId, CALLER, status],
    );

  beforeEach(async () => {
    queryRunner = global.testDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  });

  afterEach(async () => {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  });

  it('keeps the suspended runs of the previous table as suspended runs', async () => {
    const threadId = v4();
    const [{ id: suspendedRunId }] = await insertRun(threadId, 'SUSPENDED');

    await insertRun(threadId, 'COMPLETED');
    await command.down(queryRunner);

    expect(
      await queryRunner.query(
        `SELECT id FROM "core"."agentRunSuspension" WHERE "threadId" = $1`,
        [threadId],
      ),
    ).toEqual([{ id: suspendedRunId }]);

    await command.up(queryRunner);

    expect(
      await queryRunner.query(
        `SELECT id, status, outcome FROM "core"."agentRun" WHERE "threadId" = $1`,
        [threadId],
      ),
    ).toEqual([{ id: suspendedRunId, status: 'SUSPENDED', outcome: null }]);
  });

  it('lets only one suspended run hold a thread', async () => {
    const threadId = v4();

    await insertRun(threadId, 'SUSPENDED');
    await insertRun(threadId, 'COMPLETED');
    await insertRun(threadId, 'RUNNING');

    await expect(insertRun(threadId, 'SUSPENDED')).rejects.toThrow(
      /IDX_AGENT_RUN_SUSPENDED_THREAD_ID_UNIQUE/,
    );
  });
});
