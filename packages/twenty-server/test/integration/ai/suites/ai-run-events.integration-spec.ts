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
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { createScriptedLanguageModel } from 'test/utils/create-scripted-language-model.util';
import {
  buildAgentExecutionResult,
  mockAgentRunTurns,
} from 'test/utils/mock-agent-run-turns.util';
import { type AiRunEventsInput } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import {
  type AiModelRegistryService,
  type RegisteredAiModel,
} from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const WORKSPACE_SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const REPLYING_RESULT = buildAgentExecutionResult({
  result: { response: 'Acme renews in May' },
  steps: [
    { content: [{ type: 'text', text: 'Acme renews in May' }] },
  ] as AgentExecutionResult['steps'],
});

const aiRunEventsQuery = (variables: AiRunEventsInput) => ({
  query: gql`
    query AiRunEvents(
      $runId: UUID
      $agentUniversalIdentifier: UUID
      $threadKey: String
      $after: String
    ) {
      aiRunEvents(
        runId: $runId
        agentUniversalIdentifier: $agentUniversalIdentifier
        threadKey: $threadKey
        after: $after
      ) {
        id
        runId
        type
        role
        text
        error
        usage {
          inputTokens
          outputTokens
        }
      }
    }
  `,
  variables,
});

describe('AI run events (integration)', () => {
  let application: ApplicationWithResources;
  let agentUniversalIdentifier: string;
  let applicationToken: string;
  let otherApplicationAgentId: string;
  let otherApplicationAgentUniversalIdentifier: string;
  const threadIds: string[] = [];

  const listEvents = async (variables: AiRunEventsInput) => {
    const response = await makeMetadataApiRequest(
      aiRunEventsQuery(variables),
      applicationToken,
    );

    expect(response.body.errors).toBeUndefined();

    return response.body.data.aiRunEvents;
  };

  beforeAll(async () => {
    application = await setupApplicationWithResources({
      name: 'AI Run Events Probe',
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

  it('lists a run by its id or its conversation, and resumes after a cursor', async () => {
    const threadKey = randomUUID();

    mockAgentRunTurns(REPLYING_RESULT);

    const runResponse = await makeMetadataApiRequest(
      {
        query: gql`
          mutation RunAgent($input: RunAgentInput!) {
            runAgent(input: $input) {
              threadId
              runId
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

    const { threadId, runId } = runResponse.body.data.runAgent;

    threadIds.push(threadId);

    const events = await listEvents({ runId });

    expect(events).toEqual([
      expect.objectContaining({ id: `${runId}:started`, type: 'RUN_STARTED' }),
      expect.objectContaining({
        runId,
        type: 'MESSAGE',
        role: 'user',
        text: 'When does Acme renew?',
      }),
      expect.objectContaining({
        runId,
        type: 'MESSAGE',
        role: 'assistant',
        text: 'Acme renews in May',
      }),
      expect.objectContaining({
        id: `${runId}:completed`,
        type: 'RUN_COMPLETED',
      }),
    ]);
    expect(await listEvents({ agentUniversalIdentifier, threadKey })).toEqual(
      events,
    );
    expect(await listEvents({ runId, after: events[1].id })).toEqual(
      events.slice(2),
    );
  });

  it('lists a generate call, which has no conversation, as its start and end', async () => {
    const model = createScriptedLanguageModel(() => ({
      content: [{ type: 'text', text: 'Acme is a fit' }],
      finishReason: { unified: 'stop', raw: undefined },
      usage: {
        inputTokens: {
          total: 12,
          noCache: 12,
          cacheRead: undefined,
          cacheWrite: undefined,
        },
        outputTokens: { total: 3, text: 3, reasoning: undefined },
      },
    }));

    jest
      .spyOn(
        getAppProviderByClassName<AiModelRegistryService>(
          'AiModelRegistryService',
        ),
        'resolveModelForAgent',
      )
      .mockReturnValue({
        modelId: TEST_AI_MODEL_ID,
        sdkPackage: '@ai-sdk/openai',
        model,
      } as unknown as RegisteredAiModel);

    const generateResponse = await makeMetadataApiRequest(
      {
        query: gql`
          mutation Generate($input: GenerateInput!) {
            generate(input: $input) {
              success
              turnId
            }
          }
        `,
        variables: {
          input: {
            input: [{ role: 'user', content: 'Qualify Acme' }],
            modelId: TEST_AI_MODEL_ID,
          },
        },
      },
      applicationToken,
    );

    expect(generateResponse.body.errors).toBeUndefined();

    const { turnId } = generateResponse.body.data.generate;

    expect(await listEvents({ runId: turnId })).toEqual([
      expect.objectContaining({ type: 'RUN_STARTED' }),
      expect.objectContaining({
        type: 'RUN_COMPLETED',
        usage: { inputTokens: 12, outputTokens: 3 },
      }),
    ]);
  });

  it('refuses the conversations of an agent of another application', async () => {
    const response = await makeMetadataApiRequest(
      aiRunEventsQuery({
        agentUniversalIdentifier: otherApplicationAgentUniversalIdentifier,
        threadKey: randomUUID(),
      }),
      applicationToken,
    );

    expect(response.body.errors[0].extensions.code).toBe('NOT_FOUND');
  });

  it('refuses a cursor that is not an event of the run', async () => {
    const response = await makeMetadataApiRequest(
      aiRunEventsQuery({
        agentUniversalIdentifier,
        threadKey: randomUUID(),
        after: 'unknown',
      }),
      applicationToken,
    );

    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });

  it('refuses a member session', async () => {
    const response = await makeMetadataApiRequest(
      aiRunEventsQuery({ runId: randomUUID() }),
    );

    expect(response.body.errors[0].extensions.code).toBe('FORBIDDEN');
  });
});
