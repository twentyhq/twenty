import { randomUUID } from 'node:crypto';

import gql from 'graphql-tag';
import { TEST_AI_MODEL_ID } from 'test/integration/constants/test-ai-model-ids.constants';
import { createOneAgent } from 'test/integration/metadata/suites/agent/utils/create-one-agent.util';
import { deleteOneAgent } from 'test/integration/metadata/suites/agent/utils/delete-one-agent.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithResources,
  setupApplicationWithResources,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-resources.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import { mockAgentRunTurns } from 'test/utils/mock-agent-run-turns.util';
import { isDefined } from 'twenty-shared/utils';

import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const WORKSPACE_SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const REPLYING_RESULT = {
  result: { response: 'Acme renews in May' },
  usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
  cacheCreationTokens: 0,
  nativeWebSearchCallCount: 0,
  hasNoMoreAvailableCredits: false,
  modelId: 'test-model',
  steps: [{ content: [{ type: 'text', text: 'Acme renews in May' }] }],
} as unknown as AgentExecutionResult;

const agentRunEventsQuery = ({
  agentUniversalIdentifier,
  threadKey,
}: {
  agentUniversalIdentifier: string;
  threadKey: string;
}) => ({
  query: gql`
    query AgentRunEvents(
      $agentUniversalIdentifier: UUID!
      $threadKey: String!
    ) {
      agentRunEvents(
        agentUniversalIdentifier: $agentUniversalIdentifier
        threadKey: $threadKey
      ) {
        threadId
        events
      }
    }
  `,
  variables: { agentUniversalIdentifier, threadKey },
});

describe('agent run events (integration)', () => {
  let application: ApplicationWithResources;
  let agentUniversalIdentifier: string;
  let applicationToken: string;
  let otherApplicationAgentId: string;
  let otherApplicationAgentUniversalIdentifier: string;
  const threadIds: string[] = [];

  beforeAll(async () => {
    application = await setupApplicationWithResources({
      name: 'Agent Run Events Probe',
    });

    const [[agent], tokenPair, { data }] = await Promise.all([
      globalThis.testDataSource.query(
        `SELECT "universalIdentifier" FROM core."agent" WHERE id = $1`,
        [application.agentId],
      ),
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

    agentUniversalIdentifier = agent.universalIdentifier;
    applicationToken = tokenPair.applicationAccessToken.token;
    otherApplicationAgentId = data.createOneAgent.id;

    const [otherAgent] = await globalThis.testDataSource.query(
      `SELECT "universalIdentifier" FROM core."agent" WHERE id = $1`,
      [otherApplicationAgentId],
    );

    otherApplicationAgentUniversalIdentifier = otherAgent.universalIdentifier;
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

  it('lists a keyed run as its messages followed by its idle status', async () => {
    const threadKey = randomUUID();

    mockAgentRunTurns(REPLYING_RESULT);

    const runResponse = await makeMetadataApiRequest(
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
            input: [{ role: 'user', content: 'When does Acme renew?' }],
            thread: { key: threadKey },
          },
        },
      },
      applicationToken,
    );

    expect(runResponse.body.errors).toBeUndefined();
    expect(runResponse.body.data.runAgent.status).toBe('COMPLETED');

    const { threadId } = runResponse.body.data.runAgent;

    threadIds.push(threadId);

    const response = await makeMetadataApiRequest(
      agentRunEventsQuery({ agentUniversalIdentifier, threadKey }),
      applicationToken,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.agentRunEvents).toEqual({
      threadId,
      events: [
        {
          id: expect.stringMatching(/:text:0$/),
          type: 'user.message',
          content: [{ type: 'text', text: 'When does Acme renew?' }],
        },
        {
          id: expect.stringMatching(/:text:0$/),
          type: 'agent.message',
          content: [{ type: 'text', text: 'Acme renews in May' }],
        },
        {
          id: expect.stringMatching(/:idle$/),
          type: 'session.status_idle',
          stopReason: 'end_turn',
        },
      ],
    });
  });

  it('lists no events for a conversation that has not started', async () => {
    const response = await makeMetadataApiRequest(
      agentRunEventsQuery({
        agentUniversalIdentifier,
        threadKey: randomUUID(),
      }),
      applicationToken,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.agentRunEvents).toEqual({
      threadId: expect.any(String),
      events: [],
    });
  });

  it('refuses the conversations of an agent of another application', async () => {
    const response = await makeMetadataApiRequest(
      agentRunEventsQuery({
        agentUniversalIdentifier: otherApplicationAgentUniversalIdentifier,
        threadKey: randomUUID(),
      }),
      applicationToken,
    );

    expect(response.body.data).toBeNull();
    expect(response.body.errors[0].extensions.code).toBe('FORBIDDEN');
  });

  it('refuses a member session', async () => {
    const response = await makeMetadataApiRequest(
      agentRunEventsQuery({
        agentUniversalIdentifier,
        threadKey: randomUUID(),
      }),
    );

    expect(response.body.errors[0].extensions.code).toBe('FORBIDDEN');
  });
});
