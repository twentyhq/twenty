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
import {
  buildAgentExecutionResult,
  buildWaitingAgentExecutionResult,
  mockAgentRunTurns,
} from 'test/utils/mock-agent-run-turns.util';
import { type AgentTrigger } from 'twenty-shared/application';

import { type ApplicationLookupService } from 'src/engine/core-modules/application/application-lookup/application-lookup.service';
import { type PendingWakeUpResolverService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up-resolver.service';
import { fromWorkspaceEntityToFlat } from 'src/engine/core-modules/workspace/utils/from-workspace-entity-to-flat.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type AgentRunService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run.service';
import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { type AgentTriggerRunnerService } from 'src/engine/metadata-modules/ai/ai-agent-trigger/services/agent-trigger-runner.service';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { API_KEY_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/api-key-data-seeds.constant';
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

  it('lets a triggered agent wait for a duration and go on once the wake-up resolves', async () => {
    const runTurn = mockAgent(
      buildWaitingAgentExecutionResult(),
      replyingResult,
    );

    await runTrigger();

    const [suspension] = await findSuspensions('AGENT_TRIGGER', agentId);

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
    expect(runTurn).toHaveBeenCalledTimes(3);
  });
});
