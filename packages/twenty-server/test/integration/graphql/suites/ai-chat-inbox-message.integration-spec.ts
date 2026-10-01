import { parse } from 'graphql';
import { answerToolCall } from 'test/integration/graphql/suites/workflow/utils/answer-tool-call.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithResources,
  setupApplicationWithResources,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-resources.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { destroyAgentChatThread } from 'test/integration/utils/destroy-agent-chat-thread.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import { v4 as uuidv4 } from 'uuid';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { type AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const schema = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const SEND_INBOX_MESSAGE = parse(`
  mutation SendInboxMessage($input: SendInboxMessageInput!) {
    sendInboxMessage(input: $input) {
      threadId
    }
  }
`);

const QUESTIONS = [
  {
    header: 'Share',
    question: 'Do you want to share it with the other attendees?',
    options: [{ label: 'Draft a recap email' }, { label: 'Not now' }],
  },
];

// The model is not called here: the resumed stream is only checked for being
// queued.
describe('Sending an inbox message as an application', () => {
  const input = {
    workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    threadKey: `inbox-thread-${uuidv4()}`,
    idempotencyKey: 'first-recording',
    title: 'Your first call recording is ready',
    text: 'Your first call was recorded: **Weekly sync**.',
    request: { toolName: 'ask_questions', input: { questions: QUESTIONS } },
  };
  let application: ApplicationWithResources;
  let applicationToken: string;
  let threadId: string;
  let enqueueStream: jest.SpyInstance;
  const spies: jest.SpyInstance[] = [];

  const sendInboxMessage = (
    token: string,
    overrides: Record<string, unknown> = {},
  ) =>
    makeMetadataApiRequest(
      {
        query: SEND_INBOX_MESSAGE,
        variables: { input: { ...input, ...overrides } },
      },
      token,
    );

  const readPendingQuestionMessageId = async () =>
    (
      await global.testDataSource.query(
        `SELECT "pendingQuestionMessageId" FROM "${schema}"."agentChatThread" WHERE id = $1`,
        [threadId],
      )
    )[0].pendingQuestionMessageId as string | null;

  const readMessages = (id: string) =>
    global.testDataSource.query(
      `SELECT id, role, "isHidden", "senderUserWorkspaceId", "senderApplicationId"
       FROM "${schema}"."agentMessage" WHERE "threadId" = $1
       ORDER BY "processedAt" ASC`,
      [id],
    );

  beforeAll(async () => {
    application = await setupApplicationWithResources({
      name: 'Inbox Application',
      permissionFlagUniversalIdentifiers: [SystemPermissionFlag.AI],
    });
    jest.useRealTimers();

    const tokenPair = await generateApplicationTokenPair({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationId: application.id,
    });

    applicationToken = tokenPair.applicationAccessToken.token;

    const aiModelRegistryService =
      getAppProviderByClassName<AiModelRegistryService>(
        'AiModelRegistryService',
      );

    spies.push(
      jest
        .spyOn(aiModelRegistryService, 'getAvailableModels')
        .mockReturnValue([{ modelId: 'test-model' }] as never),
      jest
        .spyOn(aiModelRegistryService, 'validateModelAvailability')
        .mockReturnValue(undefined as never),
    );
    enqueueStream = jest
      .spyOn(
        global.app.get<MessageQueueService>(
          getQueueToken(MessageQueue.aiStreamQueue),
        ),
        'add',
      )
      .mockResolvedValue(undefined as never);
    spies.push(enqueueStream);

    const response = await sendInboxMessage(applicationToken);

    if (response.body.errors !== undefined) {
      throw new Error(
        `Could not send the inbox message: ${JSON.stringify(response.body.errors)}`,
      );
    }

    threadId = response.body.data.sendInboxMessage.threadId;
  });

  afterAll(async () => {
    spies.forEach((spy) => spy.mockRestore());

    if (threadId !== undefined) {
      await makeMetadataApiRequest({
        query: parse(
          'mutation Stop($threadId: UUID!) { stopAgentChatStream(threadId: $threadId) }',
        ),
        variables: { threadId },
      });
      await destroyAgentChatThread({ threadId });
    }

    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: application.universalIdentifier,
    });
  });

  it('rejects a member session', async () => {
    const response = await sendInboxMessage(APPLE_JANE_ADMIN_ACCESS_TOKEN);

    expect(response.body.errors).toBeDefined();
  });

  it('opens a conversation for the member that starts with the application message', async () => {
    const [thread] = await global.testDataSource.query(
      `SELECT title, "workspaceMemberId", "pendingQuestionMessageId"
       FROM "${schema}"."agentChatThread" WHERE id = $1`,
      [threadId],
    );
    const messages = await readMessages(threadId);

    expect(thread).toMatchObject({
      title: input.title,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    });
    expect(messages).toEqual([
      expect.objectContaining({
        role: 'user',
        isHidden: true,
        senderUserWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
        senderApplicationId: null,
      }),
      expect.objectContaining({
        role: 'assistant',
        isHidden: false,
        senderApplicationId: application.id,
      }),
    ]);
    expect(thread.pendingQuestionMessageId).toBe(messages[1].id);
  });

  it('returns the same conversation when sent again with the same key', async () => {
    const response = await sendInboxMessage(applicationToken);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sendInboxMessage.threadId).toBe(threadId);
    expect(await readMessages(threadId)).toHaveLength(2);
  });

  it('refuses another request while an earlier one waits on the member', async () => {
    const pendingQuestionMessageId = await readPendingQuestionMessageId();
    const response = await sendInboxMessage(applicationToken, {
      idempotencyKey: 'second-request',
    });

    expect(JSON.stringify(response.body.errors)).toContain(
      'THREAD_AWAITING_ANSWER',
    );
    expect(await readPendingQuestionMessageId()).toBe(pendingQuestionMessageId);
  });

  it('posts a follow-up message in the same conversation', async () => {
    const pendingQuestionMessageId = await readPendingQuestionMessageId();
    const response = await sendInboxMessage(applicationToken, {
      idempotencyKey: 'transcript-ready',
      text: 'The transcript is ready too.',
      request: null,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sendInboxMessage.threadId).toBe(threadId);
    expect(await readMessages(threadId)).toHaveLength(3);
    expect(await readPendingQuestionMessageId()).toBe(pendingQuestionMessageId);
  });

  it('lets the member answer the question and resumes the chat', async () => {
    const pendingQuestionMessageId = await readPendingQuestionMessageId();
    const response = await answerToolCall({
      toolCall: {
        threadId,
        toolCallId: `call_${pendingQuestionMessageId!.replace(/-/g, '')}`,
      },
      response: {
        answers: [{ questionIndex: 0, selectedOptionIndices: [0] }],
      },
    });

    expect(response.body.errors).toBeUndefined();
    expect(enqueueStream).toHaveBeenLastCalledWith(
      expect.any(String),
      expect.objectContaining({
        threadId,
        userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
      }),
    );
  });
});
