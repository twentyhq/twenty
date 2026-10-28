import { randomUUID } from 'node:crypto';

import gql from 'graphql-tag';
import { TEST_AI_MODEL_ID } from 'test/integration/constants/test-ai-model-ids.constants';
import { findWorkspaceCustomApplicationId } from 'test/integration/metadata/suites/application-default-role/utils/find-application-default-role.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithVariable,
  setupApplicationWithVariable,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-variable.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { destroyAgentChatThread } from 'test/integration/utils/destroy-agent-chat-thread.util';
import { expectEventually } from 'test/integration/utils/expect-eventually.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { createScriptedLanguageModel } from 'test/utils/create-scripted-language-model.util';
import { SystemPermissionFlag } from 'twenty-shared/constants';

import {
  type AiModelRegistryService,
  type RegisteredAiModel,
} from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';

const WORKFLOW_TOOL_NAME = 'list_workflows';
const CHAT_TURN_TIMEOUT_MS = 60_000;

const USAGE = {
  inputTokens: {
    total: 1,
    noCache: 1,
    cacheRead: undefined,
    cacheWrite: undefined,
  },
  outputTokens: { total: 1, text: 1, reasoning: undefined },
};

// The model answers at once, so the test sees what the turn offers it before any tool runs
const mockAnsweringModel = (): string[] => {
  const offeredToolContexts: string[] = [];
  const model = createScriptedLanguageModel((options) => {
    offeredToolContexts.push(
      [
        ...(options.tools ?? []).map((tool) => tool.name),
        ...options.prompt.flatMap((message) =>
          message.role === 'system' ? [message.content] : [],
        ),
      ].join('\n'),
    );

    return {
      content: [{ type: 'text', text: 'Done' }],
      finishReason: { unified: 'stop', raw: undefined },
      usage: USAGE,
    };
  });
  const aiModelRegistryService =
    getAppProviderByClassName<AiModelRegistryService>('AiModelRegistryService');

  jest.spyOn(aiModelRegistryService, 'resolveModelForAgent').mockReturnValue({
    modelId: TEST_AI_MODEL_ID,
    sdkPackage: '@ai-sdk/openai',
    model,
  } as unknown as RegisteredAiModel);
  jest
    .spyOn(aiModelRegistryService, 'getAvailableModels')
    .mockReturnValue([{ modelId: TEST_AI_MODEL_ID }] as never);

  return offeredToolContexts;
};

const sendChatMessageAndWaitForAnswer = async (token: string) => {
  const threadId = randomUUID();
  const response = await makeMetadataApiRequest(
    {
      query: gql`
        mutation SendChatMessage(
          $threadId: UUID!
          $text: String!
          $messageId: UUID!
        ) {
          sendChatMessage(
            threadId: $threadId
            text: $text
            messageId: $messageId
          ) {
            queued
          }
        }
      `,
      variables: { threadId, text: 'Hello', messageId: randomUUID() },
    },
    token,
  );

  expect(response.body.errors).toBeUndefined();

  await expectEventually(
    async () => {
      const messagesResponse = await makeMetadataApiRequest(
        {
          query: gql`
            query ChatMessages($threadId: UUID!) {
              chatMessages(threadId: $threadId) {
                role
              }
            }
          `,
          variables: { threadId },
        },
        token,
      );

      expect(messagesResponse.body.errors).toBeUndefined();
      expect(messagesResponse.body.data.chatMessages).toContainEqual({
        role: 'assistant',
      });
    },
    { timeoutMs: CHAT_TURN_TIMEOUT_MS },
  );

  return threadId;
};

describe('Ask AI tools for an installed application acting for a user', () => {
  let application: ApplicationWithVariable;
  let applicationToken: string;
  let workspaceCustomApplicationToken: string;
  const threadIds: string[] = [];

  beforeAll(async () => {
    application = await setupApplicationWithVariable({
      name: 'Ask AI Probe',
      variableKey: 'ASK_AI_PROBE',
      permissionFlagUniversalIdentifiers: [
        SystemPermissionFlag.AI,
        SystemPermissionFlag.WORKFLOWS,
      ],
    });

    const { applicationAccessToken } =
      await generateAppleAdminApplicationTokenPair({
        applicationId: application.id,
      });

    applicationToken = applicationAccessToken.token;

    const { applicationAccessToken: workspaceCustomApplicationAccessToken } =
      await generateAppleAdminApplicationTokenPair({
        applicationId: await findWorkspaceCustomApplicationId(),
      });

    workspaceCustomApplicationToken =
      workspaceCustomApplicationAccessToken.token;
  });

  beforeEach(() => jest.useRealTimers());

  afterEach(() => jest.restoreAllMocks());

  afterAll(async () => {
    for (const threadId of threadIds) {
      await destroyAgentChatThread({ threadId });
    }

    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: application.universalIdentifier,
    });
  });

  it(
    'still offers a member their workflow tools',
    async () => {
      const offeredToolContexts = mockAnsweringModel();

      threadIds.push(
        await sendChatMessageAndWaitForAnswer(APPLE_JANE_ADMIN_ACCESS_TOKEN),
      );

      expect(offeredToolContexts).toHaveLength(1);
      expect(offeredToolContexts[0]).toContain(WORKFLOW_TOOL_NAME);
    },
    CHAT_TURN_TIMEOUT_MS,
  );

  it(
    'does not offer the workflow tools to the application',
    async () => {
      const offeredToolContexts = mockAnsweringModel();

      threadIds.push(await sendChatMessageAndWaitForAnswer(applicationToken));

      expect(offeredToolContexts).toHaveLength(1);
      expect(offeredToolContexts[0]).not.toContain(WORKFLOW_TOOL_NAME);
    },
    CHAT_TURN_TIMEOUT_MS,
  );

  it(
    'still offers the workflow tools to the workspace custom application',
    async () => {
      const offeredToolContexts = mockAnsweringModel();

      threadIds.push(
        await sendChatMessageAndWaitForAnswer(workspaceCustomApplicationToken),
      );

      expect(offeredToolContexts).toHaveLength(1);
      expect(offeredToolContexts[0]).toContain(WORKFLOW_TOOL_NAME);
    },
    CHAT_TURN_TIMEOUT_MS,
  );
});
