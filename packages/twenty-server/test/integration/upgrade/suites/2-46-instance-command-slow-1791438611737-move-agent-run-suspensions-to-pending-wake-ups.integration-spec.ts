import { type DataSource, type QueryRunner } from 'typeorm';
import { v4 } from 'uuid';

import { MoveAgentRunSuspensionsToPendingWakeUpsSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-instance-command-slow-1791438611737-move-agent-run-suspensions-to-pending-wake-ups';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

jest.useRealTimers();

const CALLER = {
  type: 'AGENT_TRIGGER',
  ref: { agentId: v4(), triggerId: v4() },
};

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

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

  it('moves a run paused on a question and a wait at once to an answer wait', async () => {
    await command.down(queryRunner);

    const threadId = v4();
    const turnId = v4();
    const messageId = v4();
    const suspensionId = v4();
    const pendingPart = (toolName: string, toolCallId: string, index: number) =>
      queryRunner.query(
        `INSERT INTO ${SCHEMA}."agentMessagePart" (id, "messageId", "orderIndex", type, "toolName", "toolCallId", "toolInput", "toolOutput", state)
         VALUES ($1, $2, $3, $4, $5, $6, '{}'::jsonb, '{"success": true, "result": {"status": "pending"}}'::jsonb, 'output-available')`,
        [v4(), messageId, index, `tool-${toolName}`, toolName, toolCallId],
      );

    await queryRunner.query(
      `INSERT INTO ${SCHEMA}."agentChatThread" (id, title, "workspaceMemberId", "pendingQuestionMessageId")
       VALUES ($1, 'Paused run', $2, $3)`,
      [threadId, WORKSPACE_MEMBER_DATA_SEED_IDS.JANE, messageId],
    );
    await queryRunner.query(
      `INSERT INTO ${SCHEMA}."agentTurn" (id, "threadId", status) VALUES ($1, $2, 'waiting_for_input')`,
      [turnId, threadId],
    );
    await queryRunner.query(
      `INSERT INTO ${SCHEMA}."agentMessage" (id, "threadId", "turnId", role, status)
       VALUES ($1, $2, $3, 'assistant', 'sent')`,
      [messageId, threadId, turnId],
    );
    await pendingPart('ask_question', 'ask-1', 0);
    await pendingPart('wait_for_duration', 'wait-1', 1);
    await queryRunner.query(
      `INSERT INTO "core"."agentRunSuspension" (id, "workspaceId", "threadId", caller, "runSpec", "resumeCount")
       VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, 1)`,
      [
        suspensionId,
        SEED_APPLE_WORKSPACE_ID,
        threadId,
        JSON.stringify(CALLER),
        JSON.stringify(SUSPENSION.runSpec),
      ],
    );

    const [{ id: waitId }] = await queryRunner.query(
      `INSERT INTO "core"."pendingWakeUp" ("workspaceId", "ownerType", "ownerId", "ownerKey", condition, "resumeAt")
       VALUES ($1, 'AGENT_RUN', $2, 'wait-1', $3::jsonb, '2030-01-01T00:00:00Z') RETURNING id`,
      [
        SEED_APPLE_WORKSPACE_ID,
        suspensionId,
        JSON.stringify({ type: 'TIME', resumeAt: '2030-01-01T00:00:00Z' }),
      ],
    );

    await command.runDataMigration(
      queryRunner.manager as unknown as DataSource,
    );
    await command.up(queryRunner);

    const wakeUps = await queryRunner.query(
      `SELECT id, "ownerKey", condition, "resumeAt", "eventName", payload FROM "core"."pendingWakeUp"
       WHERE "ownerType" = 'AGENT_RUN' AND "ownerId" = $1`,
      [threadId],
    );

    expect(wakeUps).toEqual([
      {
        id: expect.any(String),
        ownerKey: 'RUN',
        condition: { type: 'ANSWER', threadId },
        resumeAt: null,
        eventName: null,
        payload: { ...SUSPENSION, continuationCount: 1 },
      },
    ]);
    // the wait's scheduled resolution finds nothing to claim
    expect(wakeUps[0].id).not.toBe(waitId);
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
