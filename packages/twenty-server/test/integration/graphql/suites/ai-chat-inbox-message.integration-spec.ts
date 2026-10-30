import { parse } from 'graphql';
import { answerToolCall } from 'test/integration/graphql/suites/workflow/utils/answer-tool-call.util';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithResources,
  setupApplicationWithResources,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-resources.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { destroyAgentChatThread } from 'test/integration/utils/destroy-agent-chat-thread.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import { v4 as uuidv4 } from 'uuid';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { type AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { buildInboxMessageIds } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-inbox-message-ids.util';
import { buildInboxThreadId } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-inbox-thread-id.util';
import { type AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { OPPORTUNITY_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/opportunity-data-seeds.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const schema = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const SEND_INBOX_MESSAGE = parse(`
  mutation SendInboxMessage($input: SendInboxMessageInput!) {
    sendInboxMessage(input: $input) {
      threadId
      messageId
      isNewThread
      isDismissed
    }
  }
`);

const CREATE_CHANNEL = parse(`
  mutation CreateChannel($input: CreateAgentChatChannelInput!) {
    createAgentChatChannel(input: $input) { id }
  }
`);

const DELETE_CHANNEL = parse(`
  mutation DeleteChannel($channelId: UUID!) {
    deleteAgentChatChannel(channelId: $channelId)
  }
`);

const CHANNEL_THREAD_IDS = parse(`
  query ChannelThreadIds($channelId: UUID!) {
    agentChatChannelThreadIds(channelId: $channelId) { threadIds }
  }
`);

const CHAT_MESSAGES = parse(`
  query ChatMessages($threadId: UUID!) {
    chatMessages(threadId: $threadId) { id role senderApplicationId }
  }
`);

const readThreadMessages = (
  threadId: string,
): Promise<
  {
    id: string;
    role: string;
    senderWorkspaceMemberId: string | null;
    senderApplicationId: string | null;
  }[]
> =>
  global.testDataSource.query(
    `SELECT id, role, "senderWorkspaceMemberId", "senderApplicationId"
     FROM "${schema}"."agentMessage" WHERE "threadId" = $1
     ORDER BY "processedAt" ASC, "createdAt" ASC`,
    [threadId],
  );

const QUESTION = {
  header: 'Share',
  question: 'Do you want to share it with the other attendees?',
  options: [{ label: 'Draft a recap email' }, { label: 'Not now' }],
};

// The model is not called here: the resumed stream is only checked for being
// queued.
describe('Sending an inbox message as an application', () => {
  const input = {
    workspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JANE],
    threadKey: `inbox-thread-${uuidv4()}`,
    idempotencyKey: 'first-recording',
    title: 'Your first call recording is ready',
    text: 'Your first call was recorded: **Weekly sync**.',
    toolCall: { toolName: 'ask_question', input: QUESTION },
  };
  let application: ApplicationWithResources;
  let applicationToken: string;
  let threadId: string;
  let firstDelivery: Record<string, unknown>;
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
      `SELECT id, role, "senderWorkspaceMemberId", "senderApplicationId"
       FROM "${schema}"."agentMessage" WHERE "threadId" = $1
       ORDER BY "processedAt" ASC, "createdAt" ASC`,
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

    firstDelivery = response.body.data.sendInboxMessage;
    threadId = firstDelivery.threadId as string;
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

  it('refuses to propose a record call the application could not run itself', async () => {
    const response = await sendInboxMessage(applicationToken, {
      threadKey: `inbox-thread-${uuidv4()}`,
      toolCall: {
        toolName: 'propose_tool_call',
        input: {
          toolName: 'update_one_opportunity',
          arguments: { id: OPPORTUNITY_DATA_SEED_IDS.ID_1, stage: 'WON' },
          summary: 'Mark the deal as won',
        },
      },
    });

    expect(JSON.stringify(response.body.errors)).toContain('not available');
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
        role: 'system',
        senderWorkspaceMemberId: null,
        senderApplicationId: null,
      }),
      expect.objectContaining({
        role: 'assistant',
        senderApplicationId: application.id,
      }),
    ]);
    expect(thread.pendingQuestionMessageId).toBe(messages[1].id);
    expect(firstDelivery).toEqual({
      threadId,
      messageId: messages[1].id,
      isNewThread: true,
      isDismissed: false,
    });
  });

  it('returns the same conversation and message when sent again with the same key', async () => {
    const response = await sendInboxMessage(applicationToken);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sendInboxMessage).toEqual({
      ...firstDelivery,
      isNewThread: false,
    });
    expect(await readMessages(threadId)).toHaveLength(2);
  });

  it('refuses another question while an earlier one waits on the member', async () => {
    const pendingQuestionMessageId = await readPendingQuestionMessageId();
    const response = await sendInboxMessage(applicationToken, {
      idempotencyKey: 'second-question',
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
      toolCall: null,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sendInboxMessage.threadId).toBe(threadId);
    expect(await readMessages(threadId)).toHaveLength(3);
    expect(await readPendingQuestionMessageId()).toBe(pendingQuestionMessageId);
  });

  it('adds the members a later send lists to the same conversation', async () => {
    const response = await sendInboxMessage(applicationToken, {
      workspaceMemberIds: [
        WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      ],
      idempotencyKey: 'shared-with-tim',
      text: 'Tim joins the conversation.',
      toolCall: null,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sendInboxMessage.threadId).toBe(threadId);
    expect(
      await global.testDataSource.query(
        `SELECT "isSubscribed" FROM "${schema}"."agentChatThreadParticipant"
         WHERE "threadId" = $1 AND "workspaceMemberId" = $2`,
        [threadId, WORKSPACE_MEMBER_DATA_SEED_IDS.TIM],
      ),
    ).toEqual([{ isSubscribed: true }]);
  });

  it('refuses a member who cannot have the conversation', async () => {
    const response = await sendInboxMessage(applicationToken, {
      workspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JANE, uuidv4()],
      idempotencyKey: 'shared-with-a-stranger',
      toolCall: null,
    });

    expect(JSON.stringify(response.body.errors)).toContain('THREAD_NOT_FOUND');
  });

  it('keeps a single waiting question when two are sent at once', async () => {
    const threadKey = `inbox-thread-${uuidv4()}`;
    const responses = await Promise.all(
      ['first-question', 'second-question'].map((idempotencyKey) =>
        sendInboxMessage(applicationToken, { threadKey, idempotencyKey }),
      ),
    );
    const sentResponses = responses.filter(
      (response) => response.body.errors === undefined,
    );
    const concurrentThreadId =
      sentResponses[0]?.body.data.sendInboxMessage.threadId;

    try {
      expect(sentResponses).toHaveLength(1);
      expect(
        JSON.stringify(
          responses.find((response) => response.body.errors !== undefined)?.body
            .errors,
        ),
      ).toContain('THREAD_AWAITING_ANSWER');
      expect(await readMessages(concurrentThreadId)).toHaveLength(2);
    } finally {
      if (concurrentThreadId !== undefined) {
        await destroyAgentChatThread({ threadId: concurrentThreadId });
      }
    }
  });

  it('writes nothing for a message whose parts fail, and completes it on retry', async () => {
    const threadKey = `inbox-thread-${uuidv4()}`;
    // The app runs in Jest's global setup, so its repository class is not the
    // one this file would import.
    const workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );
    const workspaceRepositoryPrototype: WorkspaceRepository =
      await workspaceOrmManager.executeInWorkspaceContext(
        () =>
          Object.getPrototypeOf(
            workspaceOrmManager.getRepository('agentMessagePart', {
              shouldBypassPermissionChecks: true,
            }),
          ),
        buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID),
        { lite: true },
      );
    const insert = workspaceRepositoryPrototype.insert;
    let partWriteCount = 0;
    const failMessagePartsSpy = jest
      .spyOn(workspaceRepositoryPrototype, 'insert')
      .mockImplementation(function (
        this: WorkspaceRepository,
        ...args: Parameters<WorkspaceRepository['insert']>
      ) {
        const { tableShape } = (
          this as unknown as {
            options: { tableShape: { nameSingular: string } };
          }
        ).options;

        // The opener's parts come first, then the application message's.
        if (
          tableShape.nameSingular === 'agentMessagePart' &&
          ++partWriteCount === 2
        ) {
          return Promise.reject(new Error('Message parts write failed'));
        }

        return insert.apply(this, args);
      });

    let failedResponse;

    try {
      failedResponse = await sendInboxMessage(applicationToken, { threadKey });
    } finally {
      failMessagePartsSpy.mockRestore();
    }

    const { threadId: failedThreadId } = buildInboxMessageIds({
      senderKey: `application:${application.id}`,
      threadKey,
      idempotencyKey: input.idempotencyKey,
    });

    try {
      expect(failedResponse.body.errors).toBeDefined();
      expect(await readMessages(failedThreadId)).toHaveLength(1);
      expect(
        (
          await global.testDataSource.query(
            `SELECT "pendingQuestionMessageId" FROM "${schema}"."agentChatThread" WHERE id = $1`,
            [failedThreadId],
          )
        )[0].pendingQuestionMessageId,
      ).toBeNull();

      const retryResponse = await sendInboxMessage(applicationToken, {
        threadKey,
      });
      const messages = await readMessages(failedThreadId);
      const [assistantParts] = await global.testDataSource.query(
        `SELECT COUNT(*)::int AS count FROM "${schema}"."agentMessagePart" WHERE "messageId" = $1`,
        [messages[1]?.id],
      );

      expect(retryResponse.body.errors).toBeUndefined();
      expect(retryResponse.body.data.sendInboxMessage.threadId).toBe(
        failedThreadId,
      );
      expect(messages).toHaveLength(2);
      expect(assistantParts.count).toBe(2);
    } finally {
      await destroyAgentChatThread({ threadId: failedThreadId });
    }
  });

  it('lets the member answer the question and resumes the chat', async () => {
    const pendingQuestionMessageId = await readPendingQuestionMessageId();
    const response = await answerToolCall({
      toolCall: {
        threadId,
        toolCallId: `call_${pendingQuestionMessageId!.replace(/-/g, '')}`,
      },
      response: { selectedOptionIndices: [0] },
    });

    expect(response.body.errors).toBeUndefined();
    expect(enqueueStream).toHaveBeenLastCalledWith(
      expect.any(String),
      expect.objectContaining({
        threadId,
        userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
      }),
      expect.anything(),
    );
  });
});

describe('Proposing a record call as an application', () => {
  let application: ApplicationWithResources;
  let applicationToken: string;
  let threadId: string | undefined;
  const opportunityId = uuidv4();

  beforeAll(async () => {
    await makeGraphqlApiRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'opportunity',
        gqlFields: 'id',
        data: { id: opportunityId, name: 'Inbox proposal deal' },
      }),
    );

    application = await setupApplicationWithResources({
      name: 'Inbox Record Application',
      permissionFlagUniversalIdentifiers: [SystemPermissionFlag.AI],
      canReadAndUpdateAllObjectRecords: true,
    });
    jest.useRealTimers();

    applicationToken = (
      await generateApplicationTokenPair({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        applicationId: application.id,
      })
    ).applicationAccessToken.token;
  });

  afterAll(async () => {
    await makeGraphqlApiRequest(
      destroyOneOperationFactory({
        objectMetadataSingularName: 'opportunity',
        gqlFields: 'id',
        recordId: opportunityId,
      }),
    );

    if (threadId !== undefined) {
      await destroyAgentChatThread({ threadId });
    }

    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: application.universalIdentifier,
    });
  });

  it('proposes an update the application could run, with the values it changes', async () => {
    const response = await makeMetadataApiRequest(
      {
        query: SEND_INBOX_MESSAGE,
        variables: {
          input: {
            workspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JANE],
            threadKey: `inbox-thread-${uuidv4()}`,
            idempotencyKey: 'record-proposal',
            title: 'A deal looks won',
            text: 'The signed quote came in.',
            toolCall: {
              toolName: 'propose_tool_call',
              input: {
                toolName: 'update_one_opportunity',
                arguments: { id: opportunityId, stage: 'WON' },
                summary: 'Mark the deal as won',
              },
            },
          },
        },
      },
      applicationToken,
    );

    expect(response.body.errors).toBeUndefined();
    threadId = response.body.data.sendInboxMessage.threadId;

    const [part] = await global.testDataSource.query(
      `SELECT part."toolOutput" FROM "${schema}"."agentMessagePart" part
       JOIN "${schema}"."agentMessage" message ON message.id = part."messageId"
       WHERE message."threadId" = $1 AND part."toolName" = 'propose_tool_call'`,
      [threadId],
    );

    const [opportunity] = await global.testDataSource.query(
      `SELECT stage FROM "${schema}"."opportunity" WHERE id = $1`,
      [opportunityId],
    );

    expect(part.toolOutput.result).toMatchObject({
      status: 'pending',
      proposal: {
        toolName: 'update_one_opportunity',
        template: 'recordUpdate',
        objectNameSingular: 'opportunity',
        recordId: opportunityId,
        currentValues: { stage: opportunity.stage },
      },
    });
  });
});

describe('Addressing channels and existing conversations as an application', () => {
  const companyId = uuidv4();
  const threadIds: string[] = [];
  const channelIds: string[] = [];
  let application: ApplicationWithResources;
  let applicationToken: string;
  let applicationRoleId: string;
  let adminRoleId: string;

  const senderKey = () => `application:${application.id}`;

  const sendInboxMessage = (input: Record<string, unknown>) =>
    makeMetadataApiRequest(
      { query: SEND_INBOX_MESSAGE, variables: { input } },
      applicationToken,
    );

  const sendOrThrow = async (input: Record<string, unknown>) => {
    const response = await sendInboxMessage(input);

    if (response.body.errors !== undefined) {
      throw new Error(
        `Could not send the inbox message: ${JSON.stringify(response.body.errors)}`,
      );
    }

    const delivery = response.body.data.sendInboxMessage as {
      threadId: string;
      messageId: string;
      isNewThread: boolean;
      isDismissed: boolean;
    };

    if (!threadIds.includes(delivery.threadId)) {
      threadIds.push(delivery.threadId);
    }

    return delivery;
  };

  const createChannel = async (roleIds: string[]): Promise<string> => {
    const response = await makeMetadataApiRequest({
      query: CREATE_CHANNEL,
      variables: { input: { name: `Inbox channel ${uuidv4()}`, roleIds } },
    });

    if (response.body.errors !== undefined) {
      throw new Error(
        `Could not create the channel: ${JSON.stringify(response.body.errors)}`,
      );
    }

    const channelId = response.body.data.createAgentChatChannel.id as string;

    channelIds.push(channelId);

    return channelId;
  };

  const createMemberThread = async (): Promise<string> => {
    const memberThreadId = uuidv4();

    await getAppProviderByClassName<AgentChatThreadService>(
      'AgentChatThreadService',
    ).createThread({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      id: memberThreadId,
      title: 'Renewal prep',
    });
    threadIds.push(memberThreadId);

    return memberThreadId;
  };

  const readThread = async (id: string) =>
    (
      await global.testDataSource.query(
        `SELECT title, "workspaceMemberId", "channelId"
         FROM "${schema}"."agentChatThread" WHERE id = $1`,
        [id],
      )
    )[0];

  const readRoleGrantIds = async (id: string): Promise<string[]> =>
    (
      await global.testDataSource.query(
        `SELECT "principalId" FROM "${schema}"."recordShare"
         WHERE "recordId" = $1 AND "rowCause" = 'RULE'
           AND "principalType" = 'ROLE' AND "deletedAt" IS NULL`,
        [id],
      )
    ).map(({ principalId }: { principalId: string }) => principalId);

  const readParticipant = async (id: string, workspaceMemberId: string) =>
    (
      await global.testDataSource.query(
        `SELECT "isSubscribed", "lastReadAt", "lastMentionedAt"
         FROM "${schema}"."agentChatThreadParticipant"
         WHERE "threadId" = $1 AND "workspaceMemberId" = $2`,
        [id, workspaceMemberId],
      )
    )[0];

  // a conversation with no owner has no member who may destroy it
  const destroyThread = async (id: string) => {
    const thread = await readThread(id);

    if (thread?.workspaceMemberId === null) {
      await global.testDataSource.query(
        `DELETE FROM "${schema}"."agentChatThread" WHERE id = $1`,
        [id],
      );

      return;
    }

    await destroyAgentChatThread({ threadId: id });
  };

  const readCompanyLinkCount = async (id: string): Promise<number> =>
    (
      await global.testDataSource.query(
        `SELECT COUNT(*)::int AS count FROM "${schema}"."agentChatThreadTarget"
         WHERE "threadId" = $1 AND "targetCompanyId" = $2 AND "deletedAt" IS NULL`,
        [id, companyId],
      )
    )[0].count;

  beforeAll(async () => {
    await makeGraphqlApiRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: 'id',
        data: { id: companyId, name: 'Inbox addressing account' },
      }),
    );

    application = await setupApplicationWithResources({
      name: 'Inbox Addressing Application',
      permissionFlagUniversalIdentifiers: [SystemPermissionFlag.AI],
      canReadAndUpdateAllObjectRecords: true,
    });
    jest.useRealTimers();

    applicationToken = (
      await generateApplicationTokenPair({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        applicationId: application.id,
      })
    ).applicationAccessToken.token;

    [{ defaultRoleId: applicationRoleId }] = await global.testDataSource.query(
      `SELECT "defaultRoleId" FROM core."application" WHERE id = $1`,
      [application.id],
    );
    adminRoleId = (await findOneRoleByLabel({ label: 'Admin' })).id;
  });

  afterAll(async () => {
    for (const id of threadIds) {
      await destroyThread(id);
    }

    for (const channelId of channelIds) {
      await makeMetadataApiRequest({
        query: DELETE_CHANNEL,
        variables: { channelId },
      });
    }

    await makeGraphqlApiRequest(
      destroyOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: 'id',
        recordId: companyId,
      }),
    );

    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: application.universalIdentifier,
    });
  });

  it('files a conversation with no owner in a channel its role reaches, granted to the channel roles', async () => {
    const channelId = await createChannel([applicationRoleId, adminRoleId]);
    const delivery = await sendOrThrow({
      channelId,
      threadKey: `escalation-${uuidv4()}`,
      idempotencyKey: 'opened',
      title: 'A ticket needs a decision',
      text: 'The customer asks for a refund.',
    });
    const messages = await readThreadMessages(delivery.threadId);
    const channelThreads = await makeMetadataApiRequest({
      query: CHANNEL_THREAD_IDS,
      variables: { channelId },
    });

    expect(delivery).toEqual({
      threadId: expect.any(String),
      messageId: messages[1].id,
      isNewThread: true,
      isDismissed: false,
    });
    expect(await readThread(delivery.threadId)).toEqual({
      title: 'A ticket needs a decision',
      workspaceMemberId: null,
      channelId,
    });
    expect(await readRoleGrantIds(delivery.threadId)).toEqual(
      expect.arrayContaining([applicationRoleId, adminRoleId]),
    );
    expect(messages).toEqual([
      expect.objectContaining({ role: 'system' }),
      expect.objectContaining({
        role: 'assistant',
        senderApplicationId: application.id,
      }),
    ]);
    expect(
      channelThreads.body.data.agentChatChannelThreadIds.threadIds,
    ).toContain(delivery.threadId);
  });

  it('files a conversation owned by its first recipient in the channel', async () => {
    const channelId = await createChannel([applicationRoleId, adminRoleId]);
    const delivery = await sendOrThrow({
      channelId,
      workspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JANE],
      threadKey: `escalation-${uuidv4()}`,
      idempotencyKey: 'opened',
      title: 'A ticket for Jane',
      text: 'The customer asks for a call.',
    });

    expect(await readThread(delivery.threadId)).toMatchObject({
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      channelId,
    });
    expect(await readRoleGrantIds(delivery.threadId)).toContain(
      applicationRoleId,
    );
    expect(
      await readParticipant(
        delivery.threadId,
        WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      ),
    ).toMatchObject({ isSubscribed: true });
  });

  it('refuses a channel its role does not reach, leaving nothing behind', async () => {
    const channelId = await createChannel([adminRoleId]);
    const threadKey = `escalation-${uuidv4()}`;
    const response = await sendInboxMessage({
      channelId,
      threadKey,
      idempotencyKey: 'opened',
      title: 'Unreachable',
      text: 'Nobody should read this.',
    });

    expect(JSON.stringify(response.body.errors)).toContain(
      'CHAT_CHANNEL_NOT_FOUND',
    );
    expect(
      await readThread(
        buildInboxThreadId({ senderKey: senderKey(), threadKey }),
      ),
    ).toBeUndefined();
  });

  it('replies by id in the conversation it opened, without opening it again', async () => {
    const opened = await sendOrThrow({
      workspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JANE],
      threadKey: `recording-${uuidv4()}`,
      idempotencyKey: 'recorded',
      title: 'Your call was recorded',
      text: 'The recording is ready.',
    });
    const reply = {
      threadId: opened.threadId,
      idempotencyKey: 'transcribed',
      text: 'The transcript is ready too.',
    };
    const delivery = await sendOrThrow(reply);
    const repeatedDelivery = await sendOrThrow(reply);
    const messages = await readThreadMessages(opened.threadId);
    const chatMessages = await makeMetadataApiRequest({
      query: CHAT_MESSAGES,
      variables: { threadId: opened.threadId },
    });

    expect(delivery).toEqual({
      threadId: opened.threadId,
      messageId: messages[2].id,
      isNewThread: false,
      isDismissed: false,
    });
    expect(repeatedDelivery).toEqual(delivery);
    expect(messages.map(({ role }) => role)).toEqual([
      'system',
      'assistant',
      'assistant',
    ]);
    expect(messages[2]).toMatchObject({
      senderWorkspaceMemberId: null,
      senderApplicationId: application.id,
    });
    expect(chatMessages.body.data.chatMessages).toEqual([
      expect.objectContaining({
        id: opened.messageId,
        senderApplicationId: application.id,
      }),
      expect.objectContaining({
        id: delivery.messageId,
        senderApplicationId: application.id,
      }),
    ]);
  });

  it('refuses a conversation it never wrote in', async () => {
    const memberThreadId = await createMemberThread();
    const response = await sendInboxMessage({
      threadId: memberThreadId,
      idempotencyKey: 'uninvited',
      text: 'This should not land.',
    });

    expect(JSON.stringify(response.body.errors)).toContain('THREAD_NOT_FOUND');
    expect(await readThreadMessages(memberThreadId)).toEqual([]);
  });

  it('refuses a message addressed both by key and by id', async () => {
    const response = await sendInboxMessage({
      workspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JANE],
      threadKey: `recording-${uuidv4()}`,
      threadId: uuidv4(),
      idempotencyKey: 'ambiguous',
      title: 'Ambiguous',
      text: 'Where does this go?',
    });

    expect(JSON.stringify(response.body.errors)).toContain(
      'INVALID_INBOX_MESSAGE_INPUT',
    );
  });

  it('delivers recipients without an obligation, and mentions members once', async () => {
    const threadKey = `review-${uuidv4()}`;
    const { threadId: reviewThreadId } = await sendOrThrow({
      workspaceMemberIds: [
        WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      ],
      mentionedWorkspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JANE],
      threadKey,
      idempotencyKey: 'review-asked',
      title: 'Review the quote',
      text: 'Can you review this quote?',
    });
    const jane = await readParticipant(
      reviewThreadId,
      WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    );
    const tim = await readParticipant(
      reviewThreadId,
      WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    );

    expect(jane).toMatchObject({
      isSubscribed: true,
      lastReadAt: null,
      lastMentionedAt: expect.anything(),
    });
    expect(tim).toEqual({
      isSubscribed: true,
      lastReadAt: null,
      lastMentionedAt: null,
    });

    const mention = {
      mentionedWorkspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.TIM],
      threadKey,
      idempotencyKey: 'review-reminded',
      title: 'Review the quote',
      text: 'Tim, your turn.',
    };

    await sendOrThrow(mention);

    const mentionedTim = await readParticipant(
      reviewThreadId,
      WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    );

    expect(mentionedTim.lastMentionedAt).not.toBeNull();

    await sendOrThrow(mention);

    expect(
      await readParticipant(reviewThreadId, WORKSPACE_MEMBER_DATA_SEED_IDS.TIM),
    ).toEqual(mentionedTim);
    expect(
      await readParticipant(
        reviewThreadId,
        WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      ),
    ).toEqual(jane);
  });

  it('attaches a record once across two sends', async () => {
    const threadKey = `recap-${uuidv4()}`;
    const recordTargets = [
      { objectNameSingular: 'company', recordId: companyId },
    ];
    const { threadId: recapThreadId } = await sendOrThrow({
      workspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JANE],
      threadKey,
      idempotencyKey: 'recap',
      title: 'Call recap',
      text: 'Here is the recap.',
      recordTargets,
    });

    await sendOrThrow({
      threadId: recapThreadId,
      idempotencyKey: 'recap-follow-up',
      text: 'And the next steps.',
      recordTargets,
    });

    expect(await readCompanyLinkCount(recapThreadId)).toBe(1);
  });

  it('refuses a record it cannot read, and writes nothing', async () => {
    const threadKey = `recap-${uuidv4()}`;
    const response = await sendInboxMessage({
      workspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JANE],
      threadKey,
      idempotencyKey: 'recap',
      title: 'Call recap',
      text: 'Here is the recap.',
      recordTargets: [{ objectNameSingular: 'company', recordId: uuidv4() }],
    });
    const unwrittenThreadId = buildInboxThreadId({
      senderKey: senderKey(),
      threadKey,
    });

    if (await readThread(unwrittenThreadId)) {
      threadIds.push(unwrittenThreadId);
    }

    expect(JSON.stringify(response.body.errors)).toContain('RECORD_NOT_FOUND');
    expect(await readThreadMessages(unwrittenThreadId)).toEqual([]);
  });
});
