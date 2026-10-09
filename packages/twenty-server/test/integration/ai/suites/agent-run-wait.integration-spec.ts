import { randomUUID } from 'node:crypto';

import gql from 'graphql-tag';
import { TEST_AI_MODEL_ID } from 'test/integration/constants/test-ai-model-ids.constants';
import { createOneAgent } from 'test/integration/metadata/suites/agent/utils/create-one-agent.util';
import { deleteOneAgent } from 'test/integration/metadata/suites/agent/utils/delete-one-agent.util';
import { updateOneAgent } from 'test/integration/metadata/suites/agent/utils/update-one-agent.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { expectEventually } from 'test/integration/utils/expect-eventually.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { type AgentTrigger } from 'twenty-shared/application';

import { type ApplicationLookupService } from 'src/engine/core-modules/application/application-lookup/application-lookup.service';
import { type PendingWakeUpResolverService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up-resolver.service';
import { fromWorkspaceEntityToFlat } from 'src/engine/core-modules/workspace/utils/from-workspace-entity-to-flat.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type AgentAsyncExecutorService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-async-executor.service';
import { type AgentRunService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run.service';
import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { type AgentChatStreamingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-streaming.service';
import { type AgentTriggerRunnerService } from 'src/engine/metadata-modules/ai/ai-agent-trigger/services/agent-trigger-runner.service';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const workspaceId = SEED_APPLE_WORKSPACE_ID;
const schema = getWorkspaceSchemaName(workspaceId);

const agentResult = (
  overrides: Partial<AgentExecutionResult>,
): AgentExecutionResult =>
  ({
    result: { response: '' },
    usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
    cacheCreationTokens: 0,
    nativeWebSearchCallCount: 0,
    hasNoMoreAvailableCredits: false,
    modelId: 'test-model',
    ...overrides,
  }) as AgentExecutionResult;

const waitingResult = ({
  toolName = 'wait_for_duration',
  wait = {
    type: 'TIME',
    resumeAt: new Date(Date.now() + 1_000).toISOString(),
  },
}: {
  toolName?: string;
  wait?: Record<string, unknown>;
} = {}) => {
  const output = {
    success: true,
    message: 'Waiting.',
    result: { status: 'pending', wait },
  };

  return agentResult({
    isPaused: true,
    steps: [
      {
        content: [
          {
            type: 'tool-call',
            toolCallId: 'wait-1',
            toolName,
            input: {},
          },
          {
            type: 'tool-result',
            toolCallId: 'wait-1',
            toolName,
            input: {},
            output,
          },
        ],
        toolResults: [{ toolCallId: 'wait-1', toolName, output }],
      },
    ] as unknown as AgentExecutionResult['steps'],
  });
};

const replyingResult = agentResult({
  result: { response: 'Followed up' },
  steps: [
    { content: [{ type: 'text', text: 'Followed up' }] },
  ] as AgentExecutionResult['steps'],
});

const mockAgent = (...results: AgentExecutionResult[]) =>
  results.reduce(
    (spy, result) => spy.mockResolvedValueOnce(result),
    jest.spyOn(
      getAppProviderByClassName<AgentAsyncExecutorService>(
        'AgentAsyncExecutorService',
      ),
      'executeAgent',
    ),
  );

const findSuspensions = (callerType: string, agentId: string) =>
  global.testDataSource.query(
    `SELECT id, "ownerId" AS "threadId", "ownerType", condition FROM core."pendingWakeUp"
     WHERE "ownerType" = 'AGENT_RUN' AND payload->'caller'->>'type' = $1
       AND payload->'caller'->'ref'->>'agentId' = $2`,
    [callerType, agentId],
  );

const findWaitCallStatus = async (threadId: string) => {
  const [part] = await global.testDataSource.query(
    `SELECT part."toolOutput"->'result'->>'status' AS status FROM "${schema}"."agentMessagePart" part
     JOIN "${schema}"."agentMessage" message ON message.id = part."messageId"
     WHERE message."threadId" = $1 AND part."toolName" IN ('wait_for_duration', 'wait_for_event')`,
    [threadId],
  );

  return part?.status;
};

const findTurnStatuses = async (threadId: string) =>
  (
    await global.testDataSource.query(
      `SELECT status FROM "${schema}"."agentTurn" WHERE "threadId" = $1 ORDER BY "createdAt"`,
      [threadId],
    )
  ).map(({ status }: { status: string }) => status);

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

  const runTrigger = () =>
    getAppProviderByClassName<AgentTriggerRunnerService>(
      'AgentTriggerRunnerService',
    ).run({
      workspaceId,
      agentId,
      triggerId,
      payload: { type: 'CRON', firedAt: new Date().toISOString() },
    });

  it('lets a triggered agent wait for a duration and go on once the wake-up resolves', async () => {
    const executeAgent = mockAgent(waitingResult(), replyingResult);

    await runTrigger();

    const [suspension] = await findSuspensions('AGENT_TRIGGER', agentId);

    expect(suspension).toMatchObject({
      ownerType: 'AGENT_RUN',
      condition: { type: 'TIME' },
    });

    // the run reads its conversation when it goes on, so a chat message cannot slip in while it waits
    await expect(
      getAppProviderByClassName<AgentChatStreamingService>(
        'AgentChatStreamingService',
      ).streamAgentChat({
        thread: { id: suspension.threadId, pendingQuestionMessageId: null },
        workspace: { id: workspaceId },
        text: 'Any news?',
      } as Parameters<AgentChatStreamingService['streamAgentChat']>[0]),
    ).rejects.toMatchObject({ code: AiExceptionCode.THREAD_AWAITING_ANSWER });
    expect(executeAgent.mock.calls[0][0].baseSystemPrompt).toContain(
      'wait_for_duration',
    );
    expect(
      Object.keys(executeAgent.mock.calls[0][0].pausingTools ?? {}),
    ).toEqual(['wait_for_event', 'wait_for_duration']);

    // the wake-up goes once the run went on, just after its turn closes
    await expectEventually(async () => {
      expect(await findTurnStatuses(suspension.threadId)).toEqual([
        'completed',
        'completed',
      ]);
      expect(await findSuspensions('AGENT_TRIGGER', agentId)).toEqual([]);
    });

    expect(executeAgent).toHaveBeenCalledTimes(2);
    expect(executeAgent.mock.calls[1][0].messages).toEqual([]);
    expect(
      JSON.stringify(executeAgent.mock.calls[1][0].priorMessages),
    ).toContain('The wait is over.');
  });

  it('refuses a chat message while a run goes on in its conversation', async () => {
    let chatAttempt: Promise<unknown> | undefined;

    jest
      .spyOn(
        getAppProviderByClassName<AgentAsyncExecutorService>(
          'AgentAsyncExecutorService',
        ),
        'executeAgent',
      )
      .mockImplementationOnce(async () => {
        const [{ threadId }] = await global.testDataSource.query(
          `SELECT "threadId" FROM "${schema}"."agentTurn" WHERE "agentId" = $1 AND status = 'running'
           ORDER BY "createdAt" DESC LIMIT 1`,
          [agentId],
        );

        // the run is not suspended yet, so only its lock on the conversation keeps the message out
        chatAttempt = getAppProviderByClassName<AgentChatStreamingService>(
          'AgentChatStreamingService',
        )
          .streamAgentChat({
            thread: { id: threadId, pendingQuestionMessageId: null },
            workspace: { id: workspaceId },
            text: 'Any news?',
          } as Parameters<AgentChatStreamingService['streamAgentChat']>[0])
          .catch((error: unknown) => error);

        await chatAttempt;

        return replyingResult;
      });

    await runTrigger();

    expect(await chatAttempt).toMatchObject({
      code: AiExceptionCode.THREAD_AWAITING_ANSWER,
    });
  });

  it('drops a waiting triggered run once its trigger is turned off', async () => {
    // an event that never happens, so only the explicit resolution below wakes the run up
    const executeAgent = mockAgent(
      waitingResult({
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

    const [{ id: wakeUpId, threadId }] = await findSuspensions(
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

    expect(executeAgent).toHaveBeenCalledTimes(1);
    expect(await findWaitCallStatus(threadId)).toBe('cancelled');
    expect(await findTurnStatuses(threadId)).toEqual(['cancelled']);

    await updateOneAgent({
      expectToFail: false,
      input: { id: agentId, triggers: [trigger] },
    });
  });

  it('answers a runAgent call whose agent waits as waiting, with its thread', async () => {
    const executeAgent = mockAgent(waitingResult(), replyingResult);

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
    });

    expect(await findSuspensions('AGENT_API_RUN', agentId)).toEqual([]);
    expect(executeAgent).toHaveBeenCalledTimes(2);
  });

  it('refuses a message to a thread whose run waits, and takes it once the run finished', async () => {
    const executeAgent = mockAgent(
      waitingResult(),
      replyingResult,
      replyingResult,
    );
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
    const thread = { key: `lead:${randomUUID()}` };
    const runOnSameThread = (content: string) =>
      agentRunService.run({
        workspace,
        requestUserWorkspaceId: null,
        requestWorkspaceMemberId: null,
        callerApplication: callerApplication ?? undefined,
        input: {
          agentUniversalIdentifier,
          input: [{ role: 'user', content }],
          thread,
        },
      });

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
    expect(executeAgent).toHaveBeenCalledTimes(3);
  });
});
