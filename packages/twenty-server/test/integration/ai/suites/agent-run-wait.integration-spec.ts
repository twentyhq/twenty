import { randomUUID } from 'node:crypto';

import gql from 'graphql-tag';
import { TEST_AI_MODEL_ID } from 'test/integration/constants/test-ai-model-ids.constants';
import { createOneAgent } from 'test/integration/metadata/suites/agent/utils/create-one-agent.util';
import { deleteOneAgent } from 'test/integration/metadata/suites/agent/utils/delete-one-agent.util';
import { updateOneAgent } from 'test/integration/metadata/suites/agent/utils/update-one-agent.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { destroyAgentChatThread } from 'test/integration/utils/destroy-agent-chat-thread.util';
import { expectEventually } from 'test/integration/utils/expect-eventually.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import {
  buildAgentExecutionResult,
  buildWaitingAgentExecutionResult,
  mockAgentRunTurns,
} from 'test/utils/mock-agent-run-turns.util';
import { type AgentTrigger } from 'twenty-shared/application';

import { type ApplicationLookupService } from 'src/engine/core-modules/application/application-lookup/application-lookup.service';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { type PendingWakeUpResolverService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up-resolver.service';
import { fromWorkspaceEntityToFlat } from 'src/engine/core-modules/workspace/utils/from-workspace-entity-to-flat.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type AgentRunService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run.service';
import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { buildAgentRunThreadId } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-thread-id.util';
import { AGENT_CHAT_WAITING_RUN_OWNER_TYPE } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-waiting-run-owner-type.constant';
import { FLUSH_QUEUED_AGENT_CHAT_MESSAGES_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-chat/jobs/flush-queued-agent-chat-messages-job-name.constant';
import { type AgentChatStreamHeartbeatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-heartbeat.service';
import { type AgentChatStreamRecoveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-recovery.service';
import { type AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { type AgentChatWaitingRunService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-waiting-run.service';
import { type RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { type StreamAgentChatJobData } from 'src/engine/metadata-modules/ai/ai-chat/jobs/stream-agent-chat-job.types';
import { type AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { type AgentTriggerRunnerService } from 'src/engine/metadata-modules/ai/ai-agent-trigger/services/agent-trigger-runner.service';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { API_KEY_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/api-key-data-seeds.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const workspaceId = SEED_APPLE_WORKSPACE_ID;
const schema = getWorkspaceSchemaName(workspaceId);

const replyingResult = buildAgentExecutionResult({
  result: { response: 'Followed up' },
  steps: [
    { content: [{ type: 'text', text: 'Followed up' }] },
  ] as AgentExecutionResult['steps'],
});

const mockAgent = (...results: AgentExecutionResult[]) =>
  mockAgentRunTurns(...results);

const findSuspensions = (callerType: string, agentId: string) =>
  global.testDataSource.query(
    `SELECT id, "ownerId" AS "threadId", "ownerType", condition FROM core."pendingWakeUp"
     WHERE "ownerType" = 'AGENT_RUN' AND payload->'caller'->>'type' = $1
       AND payload->'caller'->'ref'->>'agentId' = $2`,
    [callerType, agentId],
  );

// the turn stops running before the run's wake-up is armed, so the suspension is read until it shows
const findSuspensionEventually = async (
  callerType: string,
  agentId: string,
) => {
  await expectEventually(async () => {
    expect(await findSuspensions(callerType, agentId)).toHaveLength(1);
  });

  const [suspension] = await findSuspensions(callerType, agentId);

  return suspension;
};

const findWaitCallStatus = async (threadId: string) => {
  const [part] = await global.testDataSource.query(
    `SELECT part."toolOutput"->'result'->>'status' AS status FROM "${schema}"."agentMessagePart" part
     JOIN "${schema}"."agentMessage" message ON message.id = part."messageId"
     WHERE message."threadId" = $1 AND part."toolName" IN ('wait_for_duration', 'wait_for_event')`,
    [threadId],
  );

  return part?.status;
};

const findCallerRoleId = async (roleTargetId: string): Promise<string> => {
  const [{ roleId }] = await global.testDataSource.query(
    `SELECT "roleId" FROM core."roleTarget"
     WHERE $1 IN ("userWorkspaceId", "apiKeyId") AND "workspaceId" = $2`,
    [roleTargetId, workspaceId],
  );

  return roleId;
};

const findApplicationDefaultRoleId = async (
  applicationId: string,
): Promise<string> => {
  const [{ defaultRoleId }] = await global.testDataSource.query(
    `SELECT "defaultRoleId" FROM core.application WHERE id = $1`,
    [applicationId],
  );

  return defaultRoleId;
};

const findTurnStatuses = async (threadId: string) =>
  (
    await global.testDataSource.query(
      `SELECT status FROM "${schema}"."agentTurn" WHERE "threadId" = $1 ORDER BY "createdAt"`,
      [threadId],
    )
  ).map(({ status }: { status: string }) => status);

const findWaiters = async (threadId: string) =>
  global.testDataSource.query(
    `SELECT id FROM core."pendingWakeUp"
     WHERE "ownerId" = $1 AND "ownerType" = $2 ORDER BY "createdAt"`,
    [threadId, AGENT_CHAT_WAITING_RUN_OWNER_TYPE],
  );

const findUserMessageTexts = async (threadId: string) =>
  (
    await global.testDataSource.query(
      `SELECT part."textContent" AS text FROM "${schema}"."agentMessagePart" part
       JOIN "${schema}"."agentMessage" message ON message.id = part."messageId"
       WHERE message."threadId" = $1 AND message.role = 'user' AND part.type = 'text'
       ORDER BY message."createdAt"`,
      [threadId],
    )
  ).map(({ text }: { text: string }) => text);

const holdConversation = async (threadId: string): Promise<string> => {
  const streamId = randomUUID();

  await getAppProviderByClassName<AgentChatStreamHeartbeatService>(
    'AgentChatStreamHeartbeatService',
  ).markClaimed(streamId);
  await global.testDataSource.query(
    `UPDATE "${schema}"."agentChatThread" SET "activeStreamId" = $2 WHERE id = $1`,
    [threadId, streamId],
  );

  return streamId;
};

const releaseConversation = (threadId: string, streamId: string) =>
  getAppProviderByClassName<AgentChatStreamRecoveryService>(
    'AgentChatStreamRecoveryService',
  ).release({ threadId, workspaceId, streamId, shouldFlush: true });

describe('agent runs that wait (integration)', () => {
  const triggerId = randomUUID();
  const trigger: AgentTrigger = {
    id: triggerId,
    type: 'CRON',
    isActive: true,
    instructions: 'Follow up with new leads',
    settings: { pattern: '0 9 * * *' },
  };
  let agentId: string;
  let agentUniversalIdentifier: string;
  let agentApplicationId: string;

  beforeAll(async () => {
    const { data } = await createOneAgent({
      expectToFail: false,
      input: {
        label: 'Waiting Agent',
        prompt: 'Follow up with leads',
        modelId: TEST_AI_MODEL_ID,
        triggers: [trigger],
      },
    });

    agentId = data.createOneAgent.id;

    const [agent] = await global.testDataSource.query(
      `SELECT "universalIdentifier", "applicationId" FROM core.agent WHERE id = $1`,
      [agentId],
    );

    agentUniversalIdentifier = agent.universalIdentifier;
    agentApplicationId = agent.applicationId;
  });

  afterEach(() => jest.restoreAllMocks());

  afterAll(async () => {
    await deleteOneAgent({ expectToFail: false, input: { id: agentId } });
  });

  // a trigger starts its run in a job, so the run is awaited until its first turn is no longer running
  const runTrigger = async () => {
    const [{ startedAt }] = await global.testDataSource.query(
      `SELECT now() AS "startedAt"`,
    );

    await getAppProviderByClassName<AgentTriggerRunnerService>(
      'AgentTriggerRunnerService',
    ).run({
      workspaceId,
      agentId,
      triggerId,
      payload: { type: 'CRON', firedAt: new Date().toISOString() },
    });

    await expectEventually(async () => {
      const [turn] = await global.testDataSource.query(
        `SELECT status FROM "${schema}"."agentTurn"
         WHERE "agentId" = $1 AND "createdAt" >= $2 ORDER BY "createdAt" LIMIT 1`,
        [agentId, startedAt],
      );

      expect(turn?.status ?? 'running').not.toBe('running');
    });
  };

  const buildRunOnThread = async ({
    threadKey = `lead:${randomUUID()}`,
    waitForCompletion,
  }: {
    threadKey?: string;
    waitForCompletion?: boolean;
  } = {}) => {
    const agentRunService =
      getAppProviderByClassName<AgentRunService>('AgentRunService');
    const workspace = fromWorkspaceEntityToFlat(
      await getCoreRepository<WorkspaceEntity>(WorkspaceEntity).findOneByOrFail(
        { id: workspaceId },
      ),
    );
    const callerApplication =
      await getAppProviderByClassName<ApplicationLookupService>(
        'ApplicationLookupService',
      ).findById({ id: agentApplicationId, workspaceId });

    return (content: string) =>
      agentRunService.run({
        workspace,
        requestUserWorkspaceId: null,
        requestWorkspaceMemberId: null,
        callerApplication: callerApplication ?? undefined,
        input: {
          agentUniversalIdentifier,
          input: [{ role: 'user', content }],
          thread: { key: threadKey },
          waitForCompletion,
        },
      });
  };

  it('lets a triggered agent wait for a duration and go on once the wake-up resolves', async () => {
    const runTurn = mockAgent(
      buildWaitingAgentExecutionResult(),
      replyingResult,
    );

    await runTrigger();

    const suspension = await findSuspensionEventually('AGENT_TRIGGER', agentId);

    expect(suspension).toMatchObject({
      ownerType: 'AGENT_RUN',
      condition: { type: 'TIME' },
    });

    expect(runTurn.mock.calls[0][0].baseSystemPrompt).toContain(
      'wait_for_duration',
    );
    expect(Object.keys(runTurn.mock.calls[0][0].pausingTools ?? {})).toEqual([
      'wait_for_event',
      'wait_for_duration',
    ]);

    // the wake-up goes once the run went on, just after its turn closes
    await expectEventually(async () => {
      expect(await findTurnStatuses(suspension.threadId)).toEqual([
        'completed',
        'completed',
      ]);
      expect(await findSuspensions('AGENT_TRIGGER', agentId)).toEqual([]);
    });

    expect(runTurn).toHaveBeenCalledTimes(2);
    expect(runTurn.mock.calls[1][0].messages).toEqual([]);
    expect(JSON.stringify(runTurn.mock.calls[1][0].priorMessages)).toContain(
      'The wait is over.',
    );
  });

  it('drops a waiting triggered run once its trigger is turned off', async () => {
    // an event that never happens, so only the explicit resolution below wakes the run up
    const runTurn = mockAgent(
      buildWaitingAgentExecutionResult({
        toolName: 'wait_for_event',
        wait: {
          type: 'EVENT',
          eventName: 'opportunity.deleted',
          recordId: randomUUID(),
        },
      }),
      replyingResult,
    );

    await runTrigger();

    const { id: wakeUpId, threadId } = await findSuspensionEventually(
      'AGENT_TRIGGER',
      agentId,
    );

    expect(await findWaitCallStatus(threadId)).toBe('pending');
    expect(await findTurnStatuses(threadId)).toEqual(['waiting_for_input']);

    await updateOneAgent({
      expectToFail: false,
      input: {
        id: agentId,
        triggers: [{ ...trigger, isActive: false }],
      },
    });

    await getAppProviderByClassName<PendingWakeUpResolverService>(
      'PendingWakeUpResolverService',
    ).resolve({ workspaceId, wakeUpId });

    expect(await findSuspensions('AGENT_TRIGGER', agentId)).toEqual([]);

    expect(runTurn).toHaveBeenCalledTimes(1);
    expect(await findWaitCallStatus(threadId)).toBe('cancelled');
    expect(await findTurnStatuses(threadId)).toEqual(['cancelled']);

    await updateOneAgent({
      expectToFail: false,
      input: { id: agentId, triggers: [trigger] },
    });
  });

  it('starts a runAgent call without waiting when asked not to, its reply landing in its thread', async () => {
    const runTurn = mockAgent(replyingResult);

    const response = await makeMetadataApiRequest({
      query: gql`
        mutation RunAgent($input: RunAgentInput!) {
          runAgent(input: $input) {
            threadId
            status
            result
            error
            success
          }
        }
      `,
      variables: {
        input: {
          agentUniversalIdentifier,
          input: [{ role: 'user', content: 'Follow up tomorrow' }],
          waitForCompletion: false,
        },
      },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.runAgent).toEqual({
      threadId: expect.any(String),
      status: 'RUNNING',
      result: null,
      error: null,
      success: true,
    });

    await expectEventually(async () => {
      expect(
        await findTurnStatuses(response.body.data.runAgent.threadId),
      ).toEqual(['completed']);
    });

    expect(runTurn).toHaveBeenCalledTimes(1);
  });

  it('answers a runAgent call whose agent waits as waiting, with its thread', async () => {
    const runTurn = mockAgent(
      buildWaitingAgentExecutionResult(),
      replyingResult,
    );

    const response = await makeMetadataApiRequest({
      query: gql`
        mutation RunAgent($input: RunAgentInput!) {
          runAgent(input: $input) {
            threadId
            status
            result
            error
            success
          }
        }
      `,
      variables: {
        input: {
          agentUniversalIdentifier,
          input: [{ role: 'user', content: 'Follow up tomorrow' }],
        },
      },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.runAgent).toEqual({
      threadId: expect.any(String),
      status: 'SUSPENDED',
      result: null,
      error: null,
      success: true,
    });

    await expectEventually(async () => {
      expect(
        await findTurnStatuses(response.body.data.runAgent.threadId),
      ).toEqual(['completed', 'completed']);
      expect(await findSuspensions('AGENT_API_RUN', agentId)).toEqual([]);
    });

    expect(runTurn).toHaveBeenCalledTimes(2);
  });

  it.each([
    {
      title: 'the member whose session made it',
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      authContext: {
        type: 'user',
        userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
      },
      roleTargetId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
      callerRoleSource: 'userWorkspaceRoleId',
    },
    {
      title: 'the API key that made it',
      token: API_KEY_ACCESS_TOKEN,
      authContext: {
        type: 'apiKey',
        apiKey: expect.objectContaining({ id: API_KEY_DATA_SEED_IDS.ID_1 }),
      },
      roleTargetId: API_KEY_DATA_SEED_IDS.ID_1,
      callerRoleSource: 'apiKeyRoleId',
    },
  ])(
    'goes on with a waiting runAgent call as $title',
    async ({ token, authContext, roleTargetId, callerRoleSource }) => {
      const runTurn = mockAgent(
        buildWaitingAgentExecutionResult(),
        replyingResult,
      );

      const response = await makeMetadataApiRequest(
        {
          query: gql`
            mutation RunAgent($input: RunAgentInput!) {
              runAgent(input: $input) {
                threadId
                status
              }
            }
          `,
          variables: {
            input: {
              agentUniversalIdentifier,
              input: [{ role: 'user', content: 'Follow up tomorrow' }],
            },
          },
        },
        token,
      );

      const { threadId, status } = response.body.data.runAgent;

      expect(status).toBe('SUSPENDED');

      // the wake-up goes once the run went on, just after its turn closes
      await expectEventually(async () => {
        expect(await findTurnStatuses(threadId)).toEqual([
          'completed',
          'completed',
        ]);
        expect(await findSuspensions('AGENT_API_RUN', agentId)).toEqual([]);
      });
      expect(
        runTurn.mock.calls.map(
          ([execution]) => execution.executionContext.authContext,
        ),
      ).toEqual([
        expect.objectContaining(authContext),
        expect.objectContaining(authContext),
      ]);

      const agentRunRoleIds = {
        [callerRoleSource]: await findCallerRoleId(roleTargetId),
        applicationRoleId:
          await findApplicationDefaultRoleId(agentApplicationId),
      };

      expect(
        runTurn.mock.calls.map(
          ([execution]) => execution.executionContext.agentRunRoleIds,
        ),
      ).toEqual([agentRunRoleIds, agentRunRoleIds]);
    },
  );

  it('refuses a message to a thread whose run waits, and takes it once the run finished', async () => {
    const runTurn = mockAgent(
      buildWaitingAgentExecutionResult(),
      replyingResult,
      replyingResult,
    );
    const runOnSameThread = await buildRunOnThread();

    const waiting = await runOnSameThread('Follow up tomorrow');

    expect(waiting).toMatchObject({ success: true, status: 'SUSPENDED' });

    await expect(runOnSameThread('Any news?')).rejects.toMatchObject({
      code: AiExceptionCode.THREAD_AWAITING_ANSWER,
    });

    await expectEventually(async () => {
      expect(await findSuspensions('AGENT_API_RUN', agentId)).toEqual([]);
    });

    await expect(runOnSameThread('Any news?')).resolves.toMatchObject({
      success: true,
      status: 'COMPLETED',
      result: { response: 'Followed up' },
      threadId: waiting.threadId,
    });
    expect(runTurn).toHaveBeenCalledTimes(3);
  });

  it('waits in line for a busy conversation and starts the run once it is released', async () => {
    const runTurn = mockAgent(replyingResult, replyingResult);
    const runOnSameThread = await buildRunOnThread({
      waitForCompletion: false,
    });

    const { threadId } = await runOnSameThread('Follow up tomorrow');

    await expectEventually(async () => {
      expect(await findTurnStatuses(threadId)).toEqual(['completed']);
    });

    const streamId = await holdConversation(threadId);

    await runOnSameThread('Any news?');

    await expectEventually(async () => {
      expect(await findWaiters(threadId)).toHaveLength(1);
    });
    expect(await findTurnStatuses(threadId)).toEqual(['completed']);

    await releaseConversation(threadId, streamId);

    await expectEventually(async () => {
      expect(await findTurnStatuses(threadId)).toEqual([
        'completed',
        'completed',
      ]);
      expect(await findWaiters(threadId)).toEqual([]);
    });
    expect(runTurn).toHaveBeenCalledTimes(2);
  });

  it('starts the runs waiting on a conversation one at a time, in the order they started waiting', async () => {
    mockAgent(replyingResult, replyingResult, replyingResult);
    const runOnSameThread = await buildRunOnThread({
      waitForCompletion: false,
    });

    const { threadId } = await runOnSameThread('Follow up tomorrow');

    await expectEventually(async () => {
      expect(await findTurnStatuses(threadId)).toEqual(['completed']);
    });

    const streamId = await holdConversation(threadId);

    for (const [index, content] of [
      'First in line',
      'Second in line',
    ].entries()) {
      await runOnSameThread(content);

      await expectEventually(async () => {
        expect(await findWaiters(threadId)).toHaveLength(index + 1);
      });
    }

    await releaseConversation(threadId, streamId);

    await expectEventually(async () => {
      expect(await findTurnStatuses(threadId)).toEqual([
        'completed',
        'completed',
        'completed',
      ]);
      expect(await findWaiters(threadId)).toEqual([]);
    });
    expect(await findUserMessageTexts(threadId)).toEqual([
      'Follow up tomorrow',
      'First in line',
      'Second in line',
    ]);
  });

  it('checks a busy conversation again and reaps a holder whose worker died', async () => {
    const runTurn = mockAgent(replyingResult, replyingResult);
    const runOnSameThread = await buildRunOnThread({
      waitForCompletion: false,
    });
    const resolver = getAppProviderByClassName<PendingWakeUpResolverService>(
      'PendingWakeUpResolverService',
    );

    const { threadId } = await runOnSameThread('Follow up tomorrow');

    await expectEventually(async () => {
      expect(await findTurnStatuses(threadId)).toEqual(['completed']);
    });

    const streamId = await holdConversation(threadId);

    await runOnSameThread('Any news?');

    await expectEventually(async () => {
      expect(await findWaiters(threadId)).toHaveLength(1);
    });

    const [{ id: firstWakeUpId }] = await findWaiters(threadId);

    await resolver.resolve({ workspaceId, wakeUpId: firstWakeUpId });

    const [{ id: secondWakeUpId }] = await findWaiters(threadId);

    expect(secondWakeUpId).not.toBe(firstWakeUpId);
    expect(await findTurnStatuses(threadId)).toEqual(['completed']);

    await getAppProviderByClassName<AgentChatStreamHeartbeatService>(
      'AgentChatStreamHeartbeatService',
    ).clear(streamId);
    await resolver.resolve({ workspaceId, wakeUpId: secondWakeUpId });

    await expectEventually(async () => {
      expect(await findTurnStatuses(threadId)).toEqual([
        'completed',
        'completed',
      ]);
      expect(await findWaiters(threadId)).toEqual([]);
    });
    expect(runTurn).toHaveBeenCalledTimes(2);
  });

  it('sends the messages a member queued before a run that started waiting after them', async () => {
    const runTurn = mockAgent(replyingResult);
    const threadKey = `lead:${randomUUID()}`;
    const threadId = buildAgentRunThreadId({
      applicationId: agentApplicationId,
      agentId,
      threadKey,
    });
    const runOnSameThread = await buildRunOnThread({
      threadKey,
      waitForCompletion: false,
    });
    const aiModelRegistryService =
      getAppProviderByClassName<AiModelRegistryService>(
        'AiModelRegistryService',
      );

    jest
      .spyOn(aiModelRegistryService, 'getAvailableModels')
      .mockReturnValue([{ modelId: 'test-model' }] as never);
    jest
      .spyOn(aiModelRegistryService, 'validateModelAvailability')
      .mockReturnValue(undefined as never);
    const chatQueue = global.app.get<MessageQueueService>(
      getQueueToken(MessageQueue.aiStreamQueue),
    );
    const enqueueChatJob = chatQueue.add.bind(chatQueue);
    // chat replies are only enqueued, and each one lets go of the conversation below
    const enqueueChatReply = jest
      .spyOn(chatQueue, 'add')
      .mockImplementation(((jobName, data, options) =>
        jobName === FLUSH_QUEUED_AGENT_CHAT_MESSAGES_JOB_NAME
          ? enqueueChatJob(jobName, data, options)
          : Promise.resolve()) as typeof chatQueue.add);
    const findChatReply = (messageId: string) =>
      enqueueChatReply.mock.calls
        .map(([, data]) => data as Partial<StreamAgentChatJobData>)
        .find((data) => data.messageId === messageId);

    await getAppProviderByClassName<AgentChatThreadService>(
      'AgentChatThreadService',
    ).createThread({
      workspaceId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      id: threadId,
      title: 'Waiting line',
    });

    try {
      const holderStreamId = await holdConversation(threadId);
      const queuedMessageIds = [randomUUID(), randomUUID()];

      for (const [index, messageId] of queuedMessageIds.entries()) {
        const response = await makeMetadataApiRequest({
          query: gql`
            mutation Send($threadId: UUID!, $text: String!, $messageId: UUID!) {
              sendChatMessage(
                threadId: $threadId
                text: $text
                messageId: $messageId
              ) {
                queued
              }
            }
          `,
          variables: { threadId, text: `Queued ${index + 1}`, messageId },
        });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.sendChatMessage.queued).toBe(true);
      }

      await runOnSameThread('From the app');

      await expectEventually(async () => {
        expect(await findWaiters(threadId)).toHaveLength(1);
      });

      let streamId = holderStreamId;

      for (const messageId of queuedMessageIds) {
        await releaseConversation(threadId, streamId);

        await expectEventually(async () => {
          expect(findChatReply(messageId)).toBeDefined();
        });

        streamId = findChatReply(messageId)?.streamId ?? '';
      }

      expect(runTurn).not.toHaveBeenCalled();
      expect(await findWaiters(threadId)).toHaveLength(1);

      await releaseConversation(threadId, streamId);

      await expectEventually(async () => {
        expect(runTurn).toHaveBeenCalledTimes(1);
        expect(await findWaiters(threadId)).toEqual([]);
        expect((await findTurnStatuses(threadId)).at(-1)).toBe('completed');
      });
      expect(await findUserMessageTexts(threadId)).toEqual([
        'Queued 1',
        'Queued 2',
        'From the app',
      ]);
    } finally {
      await destroyAgentChatThread({ threadId });
    }
  });

  it('runs a delayed copy the previous release parked in Redis only when no release woke it', async () => {
    const threadId = randomUUID();
    const parkId = randomUUID();
    const waitingRunService =
      getAppProviderByClassName<AgentChatWaitingRunService>(
        'AgentChatWaitingRunService',
      );

    await getAppProviderByClassName<RedisClientService>('RedisClientService')
      .getClient()
      .hset(`agent-chat-parked-runs:${threadId}`, parkId, '{}');

    expect(
      await waitingRunService.shouldRunLegacyParkedCopy({ threadId, parkId }),
    ).toBe(true);
    expect(
      await waitingRunService.shouldRunLegacyParkedCopy({ threadId, parkId }),
    ).toBe(false);
    expect(
      await waitingRunService.shouldRunLegacyParkedCopy({ threadId }),
    ).toBe(true);
  });
});
