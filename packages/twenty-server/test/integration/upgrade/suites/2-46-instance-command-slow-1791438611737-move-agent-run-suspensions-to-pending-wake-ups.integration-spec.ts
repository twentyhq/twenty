import { type DataSource, type QueryRunner } from 'typeorm';
import { v4 } from 'uuid';

import { MoveAgentRunSuspensionsToPendingWakeUpsSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-instance-command-slow-1791438611737-move-agent-run-suspensions-to-pending-wake-ups';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

jest.useRealTimers();

const CALLER = {
  type: 'AGENT_TRIGGER',
  ref: { agentId: v4(), triggerId: v4() },
};

const SUSPENSION = {
  caller: CALLER,
  runSpec: { agentId: null, title: 'Follow up' },
  summary: null,
  continuationCount: 3,
};

describe('2-46 slow instance command 1791438611737 - MoveAgentRunSuspensionsToPendingWakeUpsSlowInstanceCommand (integration)', () => {
  const command =
    new MoveAgentRunSuspensionsToPendingWakeUpsSlowInstanceCommand();
  let queryRunner: QueryRunner;

  const insertWakeUp = ({
    ownerType,
    ownerId,
    ownerKey,
    condition,
    payload = null,
  }: {
    ownerType: string;
    ownerId: string;
    ownerKey: string;
    condition: object;
    payload?: object | null;
  }) =>
    queryRunner.query(
      `INSERT INTO "core"."pendingWakeUp" ("workspaceId", "ownerType", "ownerId", "ownerKey", condition, payload)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb)`,
      [
        SEED_APPLE_WORKSPACE_ID,
        ownerType,
        ownerId,
        ownerKey,
        JSON.stringify(condition),
        payload === null ? null : JSON.stringify(payload),
      ],
    );

  const readWakeUps = (ownerIds: string[]) =>
    queryRunner.query(
      `SELECT "ownerType", "ownerId", "ownerKey", condition, payload FROM "core"."pendingWakeUp"
       WHERE "ownerId" = ANY($1::uuid[]) ORDER BY "ownerType", condition ->> 'type'`,
      [ownerIds],
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

  it('brings suspended runs and posted call waits back to the previous shape and moves them again', async () => {
    const waitingThreadId = v4();
    const askingThreadId = v4();
    const postedThreadId = v4();
    const workflowRunId = v4();
    const timeCondition = { type: 'TIME', resumeAt: '2030-01-01T00:00:00Z' };

    await insertWakeUp({
      ownerType: 'AGENT_RUN',
      ownerId: waitingThreadId,
      ownerKey: 'RUN',
      condition: timeCondition,
      payload: SUSPENSION,
    });
    await insertWakeUp({
      ownerType: 'AGENT_RUN',
      ownerId: askingThreadId,
      ownerKey: 'RUN',
      condition: { type: 'ANSWER', threadId: askingThreadId },
      payload: SUSPENSION,
    });
    await insertWakeUp({
      ownerType: 'WORKFLOW_STEP',
      ownerId: workflowRunId,
      ownerKey: 'step',
      condition: { type: 'ANSWER', threadId: postedThreadId },
    });

    const wakeUpsBefore = await readWakeUps([
      waitingThreadId,
      askingThreadId,
      workflowRunId,
    ]);

    await command.down(queryRunner);

    expect(
      await queryRunner.query(
        `SELECT "threadId", caller, "runSpec", "resumeCount" FROM "core"."agentRunSuspension"
         WHERE "threadId" = ANY($1::uuid[]) ORDER BY "resumeCount" DESC, "runSpec" IS NULL`,
        [[waitingThreadId, askingThreadId, postedThreadId]],
      ),
    ).toEqual([
      expect.objectContaining({
        caller: CALLER,
        runSpec: SUSPENSION.runSpec,
        resumeCount: 3,
      }),
      expect.objectContaining({
        caller: CALLER,
        runSpec: SUSPENSION.runSpec,
        resumeCount: 3,
      }),
      {
        threadId: postedThreadId,
        caller: {
          type: 'WORKFLOW_STEP',
          ref: { workflowRunId, stepId: 'step' },
        },
        runSpec: null,
        resumeCount: 0,
      },
    ]);
    expect(
      await queryRunner.query(
        `SELECT condition FROM "core"."pendingWakeUp" WHERE "ownerId" =
           (SELECT id FROM "core"."agentRunSuspension" WHERE "threadId" = $1)`,
        [waitingThreadId],
      ),
    ).toEqual([{ condition: timeCondition }]);

    await command.runDataMigration(
      queryRunner.manager as unknown as DataSource,
    );
    await command.up(queryRunner);

    expect(
      await readWakeUps([waitingThreadId, askingThreadId, workflowRunId]),
    ).toEqual(wakeUpsBefore);
    expect(
      await queryRunner.query(
        `SELECT to_regclass('"core"."agentRunSuspension"') AS "table"`,
      ),
    ).toEqual([{ table: null }]);
  });

  it('keeps one wake-up per conversation', async () => {
    const threadId = v4();

    await insertWakeUp({
      ownerType: 'AGENT_RUN',
      ownerId: threadId,
      ownerKey: 'RUN',
      condition: { type: 'ANSWER', threadId },
      payload: SUSPENSION,
    });

    await expect(
      insertWakeUp({
        ownerType: 'AGENT_RUN',
        ownerId: threadId,
        ownerKey: 'RUN',
        condition: { type: 'TIME', resumeAt: '2030-01-01T00:00:00Z' },
        payload: SUSPENSION,
      }),
    ).rejects.toThrow(/UQ_PENDING_WAKE_UP_OWNER/);
  });
});
