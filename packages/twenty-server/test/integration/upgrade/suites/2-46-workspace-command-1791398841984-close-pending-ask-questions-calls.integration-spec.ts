import { randomUUID } from 'node:crypto';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type ClosePendingAskQuestionsCallsCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1791398841984-close-pending-ask-questions-calls.command';
import { RESUME_PENDING_WAKE_UP_JOB_NAME } from 'src/engine/core-modules/pending-wake-up/constants/resume-pending-wake-up-job-name.constant';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const PENDING_QUESTIONS_OUTPUT = {
  success: true,
  message: 'Waiting for the user to answer.',
  result: {
    questions: [{ header: 'Tone', question: 'Which tone?', options: [] }],
    status: 'pending',
  },
};

type SeededThread = {
  threadId: string;
  turnId: string;
  messageId: string;
};

describe('2-46 workspace command - close pending ask_questions calls (integration)', () => {
  let command: ClosePendingAskQuestionsCallsCommand;
  let workspaceOrmManager: WorkspaceOrmManager;
  let addJob: jest.SpyInstance;

  const chatThread: SeededThread = {
    threadId: randomUUID(),
    turnId: randomUUID(),
    messageId: randomUUID(),
  };
  const suspendedThread: SeededThread = {
    threadId: randomUUID(),
    turnId: randomUUID(),
    messageId: randomUUID(),
  };
  const stillWaitingThread: SeededThread = {
    threadId: randomUUID(),
    turnId: randomUUID(),
    messageId: randomUUID(),
  };
  const wakeUpId = randomUUID();
  const seededThreads = [chatThread, suspendedThread, stillWaitingThread];

  const runCommand = () =>
    workspaceOrmManager.executeInWorkspaceContext(
      () => command.up(RUN_ON_WORKSPACE_ARGS),
      buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID),
    );

  const seedThread = async ({ threadId, turnId, messageId }: SeededThread) => {
    await global.testDataSource.query(
      `INSERT INTO ${SCHEMA}."agentChatThread" (id, title, "workspaceMemberId", "pendingQuestionMessageId")
       VALUES ($1, 'Legacy questions', $2, $3)`,
      [threadId, WORKSPACE_MEMBER_DATA_SEED_IDS.JANE, messageId],
    );
    await global.testDataSource.query(
      `INSERT INTO ${SCHEMA}."agentTurn" (id, "threadId", status) VALUES ($1, $2, 'waiting_for_input')`,
      [turnId, threadId],
    );
    await global.testDataSource.query(
      `INSERT INTO ${SCHEMA}."agentMessage" (id, "threadId", "turnId", role, status)
       VALUES ($1, $2, $3, 'assistant', 'sent')`,
      [messageId, threadId, turnId],
    );
    await global.testDataSource.query(
      `INSERT INTO ${SCHEMA}."agentMessagePart" (id, "messageId", "orderIndex", type, "toolName", "toolCallId", "toolInput", "toolOutput", state)
       VALUES ($1, $2, 0, 'tool-ask_questions', 'ask_questions', $3, '{}'::jsonb, $4::jsonb, 'output-available')`,
      [
        randomUUID(),
        messageId,
        randomUUID(),
        JSON.stringify(PENDING_QUESTIONS_OUTPUT),
      ],
    );
  };

  const readThread = async ({ threadId, turnId }: SeededThread) => {
    const [thread] = await global.testDataSource.query(
      `SELECT "pendingQuestionMessageId" FROM ${SCHEMA}."agentChatThread" WHERE id = $1`,
      [threadId],
    );
    const [turn] = await global.testDataSource.query(
      `SELECT status FROM ${SCHEMA}."agentTurn" WHERE id = $1`,
      [turnId],
    );
    const parts = await global.testDataSource.query(
      `SELECT part."toolName", part."toolOutput" -> 'result' ->> 'status' AS status
       FROM ${SCHEMA}."agentMessagePart" part
       JOIN ${SCHEMA}."agentMessage" message ON message.id = part."messageId"
       WHERE message."threadId" = $1
       ORDER BY part."orderIndex"`,
      [threadId],
    );

    return {
      pendingQuestionMessageId: thread.pendingQuestionMessageId,
      turnStatus: turn.status,
      parts,
    };
  };

  beforeAll(async () => {
    command = getAppProviderByClassName<ClosePendingAskQuestionsCallsCommand>(
      'ClosePendingAskQuestionsCallsCommand',
    );
    workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );
    addJob = jest
      .spyOn(command['messageQueueService'], 'add')
      .mockResolvedValue(undefined);

    for (const seededThread of seededThreads) {
      await seedThread(seededThread);
    }

    await global.testDataSource.query(
      `INSERT INTO ${SCHEMA}."agentMessagePart" (id, "messageId", "orderIndex", type, "toolName", "toolCallId", "toolInput", "toolOutput", state)
       VALUES ($1, $2, 1, 'tool-ask_question', 'ask_question', $3, '{}'::jsonb,
         '{"success": true, "result": {"status": "pending"}}'::jsonb, 'output-available')`,
      [randomUUID(), stillWaitingThread.messageId, randomUUID()],
    );
    await global.testDataSource.query(
      `INSERT INTO "core"."pendingWakeUp" (id, "workspaceId", "ownerType", "ownerId", "ownerKey", condition, payload)
       VALUES ($1, $2, 'AGENT_RUN', $3, 'RUN', $4::jsonb, $5::jsonb)`,
      [
        wakeUpId,
        SEED_APPLE_WORKSPACE_ID,
        suspendedThread.threadId,
        JSON.stringify({ type: 'ANSWER', threadId: suspendedThread.threadId }),
        JSON.stringify({
          caller: {
            type: 'WORKFLOW_STEP',
            ref: { workflowRunId: randomUUID(), stepId: 'step' },
          },
          runSpec: {},
          summary: null,
          continuationCount: 2,
        }),
      ],
    );
  });

  afterAll(async () => {
    addJob.mockRestore();

    await global.testDataSource.query(
      `DELETE FROM "core"."pendingWakeUp" WHERE id = $1`,
      [wakeUpId],
    );

    for (const { threadId } of seededThreads) {
      await global.testDataSource.query(
        `DELETE FROM ${SCHEMA}."agentMessagePart" WHERE "messageId" IN
           (SELECT id FROM ${SCHEMA}."agentMessage" WHERE "threadId" = $1)`,
        [threadId],
      );

      for (const table of ['agentMessage', 'agentTurn']) {
        await global.testDataSource.query(
          `DELETE FROM ${SCHEMA}."${table}" WHERE "threadId" = $1`,
          [threadId],
        );
      }

      await global.testDataSource.query(
        `DELETE FROM ${SCHEMA}."agentChatThread" WHERE id = $1`,
        [threadId],
      );
    }
  });

  it('closes the calls and stops the conversations waiting when nothing else is pending', async () => {
    await runCommand();

    for (const seededThread of [chatThread, suspendedThread]) {
      expect(await readThread(seededThread)).toEqual({
        pendingQuestionMessageId: null,
        turnStatus: 'completed',
        parts: [{ toolName: 'ask_questions', status: 'skipped' }],
      });
    }
  });

  it('keeps a conversation waiting on another pending call', async () => {
    expect(await readThread(stillWaitingThread)).toEqual({
      pendingQuestionMessageId: stillWaitingThread.messageId,
      turnStatus: 'waiting_for_input',
      parts: [
        { toolName: 'ask_questions', status: 'skipped' },
        { toolName: 'ask_question', status: 'pending' },
      ],
    });
  });

  it('resolves the wake-up of the agent run suspended on the closed call', async () => {
    expect(addJob).toHaveBeenCalledTimes(1);
    expect(addJob).toHaveBeenCalledWith(RESUME_PENDING_WAKE_UP_JOB_NAME, {
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      wakeUpId,
      answer: { result: {} },
    });
  });

  it('resolves the wake-up again on a rerun, as long as it was not claimed', async () => {
    addJob.mockClear();

    await runCommand();

    expect(addJob).toHaveBeenCalledTimes(1);
    expect(addJob).toHaveBeenCalledWith(RESUME_PENDING_WAKE_UP_JOB_NAME, {
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      wakeUpId,
      answer: { result: {} },
    });
    expect(await readThread(chatThread)).toEqual({
      pendingQuestionMessageId: null,
      turnStatus: 'completed',
      parts: [{ toolName: 'ask_questions', status: 'skipped' }],
    });
  });
});
