import { type QueryRunner } from 'typeorm';
import { v4 } from 'uuid';

import { MovePostedCallWaitsToAnswerWakeUpsFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-instance-command-fast-1791417349093-move-posted-call-waits-to-answer-wake-ups';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

jest.useRealTimers();

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

describe('2-46 fast instance command 1791417349093 - MovePostedCallWaitsToAnswerWakeUpsFastInstanceCommand (integration)', () => {
  const command = new MovePostedCallWaitsToAnswerWakeUpsFastInstanceCommand();
  let queryRunner: QueryRunner;

  // the shape a workflow step that posted a call left before: a run without a spec on its conversation
  const seedPostedCall = async (toolStatus: string) => {
    const threadId = v4();
    const messageId = v4();
    const turnId = v4();
    const toolCallId = v4();
    const workflowRunId = v4();

    await queryRunner.query(
      `INSERT INTO ${SCHEMA}."agentChatThread" (id, title, "workspaceMemberId", "pendingQuestionMessageId")
       VALUES ($1, 'Approval', $2, $3)`,
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
    await queryRunner.query(
      `INSERT INTO ${SCHEMA}."agentMessagePart" (id, "messageId", "orderIndex", type, "toolName", "toolCallId", "toolInput", "toolOutput", state)
       VALUES ($1, $2, 0, 'tool-propose_tool_call', 'propose_tool_call', $3, '{}'::jsonb, $4::jsonb, 'output-available')`,
      [
        v4(),
        messageId,
        toolCallId,
        JSON.stringify({
          result: { status: toolStatus },
          awaitedByCaller: true,
        }),
      ],
    );
    await queryRunner.query(
      `INSERT INTO "core"."agentRun" ("workspaceId", "threadId", caller, "runSpec", status)
       VALUES ($1, $2, $3::jsonb, NULL, 'SUSPENDED')`,
      [
        SEED_APPLE_WORKSPACE_ID,
        threadId,
        JSON.stringify({
          type: 'WORKFLOW_STEP',
          ref: { workflowRunId, stepId: 'step' },
        }),
      ],
    );

    return { threadId, toolCallId, workflowRunId };
  };

  const readAnswerWaits = (workflowRunId: string) =>
    queryRunner.query(
      `SELECT "ownerType", "ownerKey", condition FROM "core"."pendingWakeUp" WHERE "ownerId" = $1`,
      [workflowRunId],
    );

  beforeEach(async () => {
    queryRunner = global.testDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    await command.down(queryRunner);
  });

  afterEach(async () => {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  });

  it('moves a step waiting on the answer to its posted call to an ANSWER wake-up', async () => {
    const { threadId, toolCallId, workflowRunId } =
      await seedPostedCall('pending');

    await command.up(queryRunner);

    expect(await readAnswerWaits(workflowRunId)).toEqual([
      {
        ownerType: 'WORKFLOW_STEP',
        ownerKey: 'step',
        condition: { type: 'ANSWER', threadId, toolCallId },
      },
    ]);
    expect(
      await queryRunner.query(
        `SELECT id FROM "core"."agentRun" WHERE "threadId" = $1`,
        [threadId],
      ),
    ).toEqual([]);
  });

  it('drops the run of a call that no longer waits, and requires a spec from then on', async () => {
    const { threadId, workflowRunId } = await seedPostedCall('approved');

    await command.up(queryRunner);

    expect(await readAnswerWaits(workflowRunId)).toEqual([]);
    await expect(
      queryRunner.query(
        `INSERT INTO "core"."agentRun" ("workspaceId", "threadId", caller, status)
         VALUES ($1, $2, '{}'::jsonb, 'RUNNING')`,
        [SEED_APPLE_WORKSPACE_ID, threadId],
      ),
    ).rejects.toThrow(/runSpec/);
  });

  it('brings an ANSWER wake-up back to a run without a spec', async () => {
    const { threadId, workflowRunId } = await seedPostedCall('pending');

    await command.up(queryRunner);
    await command.down(queryRunner);

    expect(await readAnswerWaits(workflowRunId)).toEqual([]);
    expect(
      await queryRunner.query(
        `SELECT "runSpec", status FROM "core"."agentRun" WHERE "threadId" = $1`,
        [threadId],
      ),
    ).toEqual([{ runSpec: null, status: 'SUSPENDED' }]);
  });
});
