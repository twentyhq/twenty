import { randomUUID } from 'node:crypto';

import { TEST_AI_MODEL_ID } from 'test/integration/constants/test-ai-model-ids.constants';
import { createOneAgent } from 'test/integration/metadata/suites/agent/utils/create-one-agent.util';
import { deleteOneAgent } from 'test/integration/metadata/suites/agent/utils/delete-one-agent.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithResources,
  setupApplicationWithResources,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-resources.util';
import { agentConversationHistoryQueryFactory } from 'test/integration/ai/utils/agent-conversation-history-query-factory.util';
import { runAgentInConversationQueryFactory } from 'test/integration/ai/utils/run-agent-in-conversation-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import {
  buildAgentExecutionResult,
  mockAgentRunTurns,
} from 'test/utils/mock-agent-run-turns.util';
import { isDefined } from 'twenty-shared/utils';

import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const WORKSPACE_SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const REPLYING_RESULT = buildAgentExecutionResult({
  result: { response: 'Acme renews in May' },
  steps: [
    { content: [{ type: 'text', text: 'Acme renews in May' }] },
  ] as AgentExecutionResult['steps'],
});

const findAgentUniversalIdentifier = async (agentId: string) => {
  const [agent] = await globalThis.testDataSource.query(
    `SELECT "universalIdentifier" FROM core."agent" WHERE id = $1`,
    [agentId],
  );

  return agent.universalIdentifier;
};

describe('Agent conversations read by their application (integration)', () => {
  let application: ApplicationWithResources;
  let agentUniversalIdentifier: string;
  let applicationToken: string;
  let otherApplicationAgentId: string;
  let otherApplicationAgentUniversalIdentifier: string;
  const threadIds: string[] = [];

  beforeAll(async () => {
    application = await setupApplicationWithResources({
      name: 'Agent Conversation Probe',
    });

    const [applicationAgentUniversalIdentifier, tokenPair, { data }] =
      await Promise.all([
        findAgentUniversalIdentifier(application.agentId),
        generateApplicationTokenPair({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          applicationId: application.id,
        }),
        createOneAgent({
          expectToFail: false,
          input: {
            label: 'Agent Of Another Application',
            prompt: 'Answer questions',
            modelId: TEST_AI_MODEL_ID,
          },
        }),
      ]);

    agentUniversalIdentifier = applicationAgentUniversalIdentifier;
    applicationToken = tokenPair.applicationAccessToken.token;
    otherApplicationAgentId = data.createOneAgent.id;

    otherApplicationAgentUniversalIdentifier =
      await findAgentUniversalIdentifier(otherApplicationAgentId);
  }, 120000);

  afterEach(() => jest.restoreAllMocks());

  afterAll(async () => {
    // no member is granted the threads runAgent creates, so the API cannot destroy them
    await globalThis.testDataSource.query(
      `DELETE FROM "${WORKSPACE_SCHEMA}"."agentChatThread" WHERE id = ANY($1)`,
      [threadIds],
    );

    if (isDefined(otherApplicationAgentId)) {
      await deleteOneAgent({
        expectToFail: false,
        input: { id: otherApplicationAgentId },
      });
    }

    if (isDefined(application)) {
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier: application.universalIdentifier,
      });
    }
  });

  it('reads the history of a run through the chat queries, named by agent and key', async () => {
    const threadKey = randomUUID();

    mockAgentRunTurns(REPLYING_RESULT);

    const runResponse = await makeMetadataApiRequest(
      runAgentInConversationQueryFactory({
        agentUniversalIdentifier,
        content: 'When does Acme renew?',
        threadKey,
      }),
      applicationToken,
    );

    expect(runResponse.body.errors).toBeUndefined();
    expect(runResponse.body.data.runAgent.status).toBe('COMPLETED');

    const { threadId, runId } = runResponse.body.data.runAgent;

    threadIds.push(threadId);

    const historyResponse = await makeMetadataApiRequest(
      agentConversationHistoryQueryFactory({
        agentUniversalIdentifier,
        threadKey,
      }),
      applicationToken,
    );

    expect(historyResponse.body.errors).toBeUndefined();
    expect(historyResponse.body.data.chatMessages).toEqual([
      {
        threadId,
        turnId: runId,
        role: 'user',
        parts: [{ type: 'text', textContent: 'When does Acme renew?' }],
      },
      {
        threadId,
        turnId: runId,
        role: 'assistant',
        parts: [
          { type: 'step-start', textContent: '' },
          { type: 'text', textContent: 'Acme renews in May' },
        ],
      },
    ]);
    expect(historyResponse.body.data.chatStreamCatchupChunks).toEqual({
      chunks: [],
      maxSeq: 0,
    });
  });

  it('reads a conversation before its first run as empty', async () => {
    const response = await makeMetadataApiRequest(
      agentConversationHistoryQueryFactory({
        agentUniversalIdentifier,
        threadKey: randomUUID(),
      }),
      applicationToken,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.chatMessages).toEqual([]);
  });

  it('refuses the conversations of an agent of another application', async () => {
    const response = await makeMetadataApiRequest(
      agentConversationHistoryQueryFactory({
        agentUniversalIdentifier: otherApplicationAgentUniversalIdentifier,
        threadKey: randomUUID(),
      }),
      applicationToken,
    );

    expect(response.body.errors[0].extensions.code).toBe('FORBIDDEN');
  });

  it('refuses a thread id together with a key', async () => {
    const response = await makeMetadataApiRequest(
      agentConversationHistoryQueryFactory({
        threadId: randomUUID(),
        agentUniversalIdentifier,
        threadKey: randomUUID(),
      }),
      applicationToken,
    );

    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });

  it('refuses a thread id from an application without a member', async () => {
    const response = await makeMetadataApiRequest(
      agentConversationHistoryQueryFactory({ threadId: randomUUID() }),
      applicationToken,
    );

    expect(response.body.errors[0].extensions.code).toBe('NOT_FOUND');
  });

  it('refuses a conversation named by key from a member session', async () => {
    const response = await makeMetadataApiRequest(
      agentConversationHistoryQueryFactory({
        agentUniversalIdentifier,
        threadKey: randomUUID(),
      }),
    );

    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });
});
