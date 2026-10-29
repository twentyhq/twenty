import { randomUUID } from 'node:crypto';

import { parse } from 'graphql';
import { configureChatParticipationModels } from 'test/integration/ai/utils/configure-chat-participation-models.util';
import { createChatParticipationTestContext } from 'test/integration/ai/utils/create-chat-participation-test-context.util';
import { runWithRejectedChatWrite } from 'test/integration/ai/utils/run-with-rejected-chat-write.util';
import { runWithReadOnlyChatPermission } from 'test/integration/ai/utils/run-with-read-only-chat-permission.util';
import { waitForBlockedDatabaseQueryOrThrow } from 'test/integration/ai/utils/wait-for-blocked-database-query-or-throw.util';
import { sendChatParticipationMessage } from 'test/integration/graphql/utils/send-chat-participation-message.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { FeatureFlagKey, RecordShareAccessLevel } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { type RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { type AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { type AgentChatQueueService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-queue.service';
import { getCancelChannel } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-cancel-channel.util';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { type WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const READ_THREAD = parse(`
  query SharedConversation($threadId: UUID!) {
    chatThread(id: $threadId) { id }
    chatMessages(threadId: $threadId) { id senderWorkspaceMemberId senderUserWorkspaceId }
    chatStreamCatchupChunks(threadId: $threadId) { chunks maxSeq }
  }
`);
const DELETE_QUEUED_MESSAGE = parse(`
  mutation DeleteSharedQueuedMessage($messageId: UUID!) {
    deleteQueuedChatMessage(messageId: $messageId)
  }
`);
const STOP_STREAM = parse(`
  mutation StopSharedConversation($threadId: UUID!) {
    stopAgentChatStream(threadId: $threadId)
  }
`);

describe('Shared conversation API boundaries', () => {
  let context: Awaited<ReturnType<typeof createChatParticipationTestContext>>;
  let models: ReturnType<typeof configureChatParticipationModels>;
  let queue: AgentChatQueueService;

  beforeEach(async () => {
    context = await createChatParticipationTestContext();
    models = configureChatParticipationModels();
    queue = getAppProviderByClassName<AgentChatQueueService>(
      'AgentChatQueueService',
    );
  });

  afterEach(async () => {
    await context.cleanup();
    models.restore();
    jest.restoreAllMocks();
  });

  const readThread = (threadId: string) =>
    makeMetadataApiRequest(
      { query: READ_THREAD, variables: { threadId } },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );
  const markDeleted = (threadId: string) =>
    global.testDataSource.query(
      `UPDATE "${context.schema}"."agentChatThread" SET "deletedAt" = now() WHERE id = $1`,
      [threadId],
    );
  const observeRestores = (threadId: string) => {
    const emitter = getAppProviderByClassName<WorkspaceEventEmitter>(
      'WorkspaceEventEmitter',
    );
    const emit = jest.spyOn(emitter, 'emitDatabaseBatchEvent');

    return () =>
      emit.mock.calls.filter(
        ([event]) =>
          isDefined(event) &&
          event.objectMetadataNameSingular === 'agentChatThread' &&
          event.action === DatabaseEventAction.RESTORED &&
          event.events.some(({ recordId }) => recordId === threadId),
      );
  };

  const readTurnCount = async (threadId: string) => {
    const [{ count }]: { count: number }[] = await global.testDataSource.query(
      `SELECT count(*)::int AS count FROM "${context.schema}"."agentTurn" WHERE "threadId" = $1`,
      [threadId],
    );

    return count;
  };
  const createSharedThread = async () => {
    const threadId = await context.createThread();

    await context.share({
      threadId,
      recipientWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      accessLevel: RecordShareAccessLevel.READ,
    });

    return threadId;
  };

  it('reads messages and catchup for a viewer without changing ownership and rejects every read after revocation', async () => {
    const threadId = await context.createThread(false);
    const message = await context.saveMessage({ threadId });
    const publisher = getAppProviderByClassName<AgentChatEventPublisherService>(
      'AgentChatEventPublisherService',
    );

    await publisher.publish({
      workspaceId: context.workspaceId,
      threadId,
      event: {
        type: 'stream-chunk',
        chunk: { type: 'text-delta', id: 'answer', delta: 'Stored answer' },
      },
    });
    await context.share({
      threadId,
      recipientWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      accessLevel: RecordShareAccessLevel.READ,
    });
    const readable = await readThread(threadId);

    expect(readable.body.errors).toBeUndefined();
    expect(readable.body.data.chatThread.id).toBe(threadId);
    expect(readable.body.data.chatMessages).toContainEqual(
      expect.objectContaining({ id: message.id }),
    );
    expect(readable.body.data.chatStreamCatchupChunks).toEqual({
      chunks: [{ type: 'text-delta', id: 'answer', delta: 'Stored answer' }],
      maxSeq: 1,
    });

    await context.share({
      threadId,
      recipientWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      accessLevel: RecordShareAccessLevel.NONE,
    });
    for (const selection of [
      'chatThread(id: $threadId) { id }',
      'chatMessages(threadId: $threadId) { id }',
      'chatStreamCatchupChunks(threadId: $threadId) { maxSeq }',
    ]) {
      const revoked = await makeMetadataApiRequest(
        {
          query: parse(`query($threadId: UUID!) { ${selection} }`),
          variables: { threadId },
        },
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );

      expect(revoked.body.errors).toBeDefined();
    }
    expect((await context.readThread(threadId)).workspaceMemberId).toBe(
      context.workspaceMemberId,
    );
    await publisher.resetStreamState(threadId);
  });

  it('denies a viewer send, restore, queued deletion and cancellation while allowing an editor to delete a queued message', async () => {
    const threadId = await context.createThread(false);
    const queued = await queue.queueMessage({
      workspaceId: context.workspaceId,
      threadId,
      workspaceMemberId: context.workspaceMemberId,
      userWorkspaceId: context.userWorkspaceId,
      text: 'An existing queued message',
    });
    const streamId = randomUUID();

    await context.share({
      threadId,
      recipientWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      accessLevel: RecordShareAccessLevel.READ,
    });
    await global.testDataSource.query(
      `UPDATE "${context.schema}"."agentChatThread" SET "activeStreamId" = $2 WHERE id = $1`,
      [threadId, streamId],
    );
    const redis =
      getAppProviderByClassName<RedisClientService>(
        'RedisClientService',
      ).getClient();
    const publish = jest.spyOn(redis, 'publish');
    const sent = await sendChatParticipationMessage({
      threadId,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });
    const stopped = await makeMetadataApiRequest(
      { query: STOP_STREAM, variables: { threadId } },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );
    const deleted = await makeMetadataApiRequest(
      { query: DELETE_QUEUED_MESSAGE, variables: { messageId: queued.id } },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    for (const response of [sent, stopped, deleted]) {
      expect(response.body.errors).toBeDefined();
    }
    expect(publish).not.toHaveBeenCalledWith(
      getCancelChannel(threadId, streamId),
      'cancel',
    );
    expect((await context.readThread(threadId)).activeStreamId).toBe(streamId);
    expect(
      await queue.findQueuedMessage({
        messageId: queued.id,
        workspaceId: context.workspaceId,
      }),
    ).toBeDefined();

    await markDeleted(threadId);
    await expect(
      context.threadService.restoreThread({
        threadId,
        workspaceId: context.workspaceId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      }),
    ).rejects.toBeDefined();
    expect((await context.readThread(threadId)).deletedAt).not.toBeNull();
    await global.testDataSource.query(
      `UPDATE "${context.schema}"."agentChatThread" SET "deletedAt" = NULL, "activeStreamId" = NULL WHERE id = $1`,
      [threadId],
    );
    await context.share({
      threadId,
      recipientWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      accessLevel: RecordShareAccessLevel.READ_WRITE,
    });
    const editorDeleted = await makeMetadataApiRequest(
      { query: DELETE_QUEUED_MESSAGE, variables: { messageId: queued.id } },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(editorDeleted.body.errors).toBeUndefined();
    expect(editorDeleted.body.data.deleteQueuedChatMessage).toBe(true);
    expect(
      await queue.findQueuedMessage({
        messageId: queued.id,
        workspaceId: context.workspaceId,
      }),
    ).toBeNull();
  });

  it('restores a deleted conversation before saving a message and announces the committed restore', async () => {
    const threadId = await context.createThread(false);
    const messageId = randomUUID();

    await context.saveMessage({ threadId });
    await markDeleted(threadId);
    const restores = observeRestores(threadId);
    const response = await sendChatParticipationMessage({
      threadId,
      messageId,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sendChatMessage.streamId).toEqual(
      expect.any(String),
    );
    expect((await context.readThread(threadId)).deletedAt).toBeNull();
    expect(restores()).toHaveLength(1);
    const messages = await context.chatService.getMessagesForThread({
      threadId,
      workspaceId: context.workspaceId,
      workspaceMemberId: context.workspaceMemberId,
    });

    expect(messages).toContainEqual(expect.objectContaining({ id: messageId }));
  });

  it('keeps the conversation deleted and emits no restore when the database rejects restoration', async () => {
    const threadId = await context.createThread(false);
    const messageId = randomUUID();

    await context.saveMessage({ threadId });
    await markDeleted(threadId);
    const restores = observeRestores(threadId);
    const response = await runWithRejectedChatWrite({
      workspaceId: context.workspaceId,
      threadId,
      operation: 'restore',
      work: async () =>
        sendChatParticipationMessage({
          threadId,
          messageId,
          shouldAssistantReply: false,
        }),
    });

    expect(response.body.errors).toBeDefined();
    expect((await context.readThread(threadId)).deletedAt).not.toBeNull();
    expect(restores()).toHaveLength(0);
    const messages = await global.testDataSource.query(
      `SELECT id FROM "${context.schema}"."agentMessage" WHERE id = $1`,
      [messageId],
    );

    expect(messages).toEqual([]);
  });

  it('adds newly mentioned members once after a saved message without counting rejected members', async () => {
    const threadId = await context.createThread();
    const recipientId = WORKSPACE_MEMBER_DATA_SEED_IDS.JONY;

    await context.saveMessage({ threadId });
    const response = await sendChatParticipationMessage({
      threadId,
      mentionedWorkspaceMemberIds: [
        recipientId,
        recipientId,
        randomUUID(),
        WORKSPACE_MEMBER_DATA_SEED_IDS.SCOTT,
      ],
    });

    expect(response.body.errors).toBeUndefined();
    expect(
      response.body.data.sendChatMessage.mentionedParticipantWorkspaceMemberIds,
    ).toEqual([recipientId]);
    expect(await context.readParticipants(threadId)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          workspaceMemberId: recipientId,
          lastMentionedAt: expect.anything(),
          lastReadAt: null,
        }),
      ]),
    );
    expect(
      (await context.readParticipants(threadId)).filter(
        ({ workspaceMemberId }) => workspaceMemberId === recipientId,
      ),
    ).toHaveLength(1);
  });

  it('keeps a saved message sent when granting its mentions fails', async () => {
    const threadId = await context.createThread(false);
    const messageId = randomUUID();

    await context.saveMessage({ threadId });
    const response = await runWithRejectedChatWrite({
      workspaceId: context.workspaceId,
      threadId,
      operation: 'share',
      work: async () =>
        sendChatParticipationMessage({
          threadId,
          messageId,
          mentionedWorkspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
        }),
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sendChatMessage).toMatchObject({
      messageId,
      queued: false,
      mentionedParticipantWorkspaceMemberIds: [],
    });
    const messages = await context.chatService.getMessagesForThread({
      threadId,
      workspaceId: context.workspaceId,
      workspaceMemberId: context.workspaceMemberId,
    });

    expect(messages).toContainEqual(expect.objectContaining({ id: messageId }));
    expect(await context.readParticipants(threadId)).not.toContainEqual(
      expect.objectContaining({
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      }),
    );
  });

  it('executes an editing participant message as its sender and preserves sender names for cached clients', async () => {
    const threadId = await context.createThread(false);
    const messageId = randomUUID();

    await context.saveMessage({ threadId });
    await context.share({
      threadId,
      recipientWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      accessLevel: RecordShareAccessLevel.READ_WRITE,
    });
    const response = await sendChatParticipationMessage({
      threadId,
      messageId,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sendChatMessage.streamId).toEqual(
      expect.any(String),
    );
    await waitForAllJobsToFinish();
    const messages = await readThread(threadId);

    expect(messages.body.errors).toBeUndefined();
    expect(messages.body.data.chatMessages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: messageId,
          senderWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          senderUserWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
        }),
        expect.objectContaining({
          senderWorkspaceMemberId: null,
          senderUserWorkspaceId: null,
        }),
      ]),
    );
    const execution = await global.testDataSource.query(
      `SELECT "createdByWorkspaceMemberId" FROM "${context.schema}"."agentTurn" WHERE "threadId" = $1 AND status = $2`,
      [threadId, AgentTurnStatus.COMPLETED],
    );

    expect(execution).toContainEqual({
      createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    });
  });

  it('does not let ownership bypass a revoked update permission', async () => {
    const threadId = context.registerThread();

    await context.threadService.createThread({
      id: threadId,
      workspaceId: context.workspaceId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    });
    await runWithReadOnlyChatPermission({
      workspaceId: context.workspaceId,
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
      work: async () => {
        const readable = await readThread(threadId);
        const sent = await sendChatParticipationMessage({
          threadId,
          token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
        });

        expect(readable.body.errors).toBeUndefined();
        expect(sent.body.errors).toBeDefined();
        expect(
          await context.chatService.hasMessages({
            threadId,
            workspaceId: context.workspaceId,
          }),
        ).toBe(false);
      },
    });
  });

  it('cannot take over a chat ID that another member creates concurrently', async () => {
    const threadId = context.registerThread();
    const runner = global.testDataSource.createQueryRunner();

    await runner.connect();
    await runner.startTransaction();
    const [{ backendProcessId }]: { backendProcessId: number }[] =
      await runner.query('SELECT pg_backend_pid() AS "backendProcessId"');
    await runner.query(
      `INSERT INTO "${context.schema}"."agentChatThread" (id, "workspaceMemberId") VALUES ($1, $2)`,
      [threadId, context.workspaceMemberId],
    );
    const sending = sendChatParticipationMessage({
      threadId,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    }).then((response) => response);

    try {
      await waitForBlockedDatabaseQueryOrThrow(backendProcessId);
      await runner.commitTransaction();
      const response = await sending;

      expect(response.body.errors).toBeDefined();
      expect((await context.readThread(threadId)).workspaceMemberId).toBe(
        context.workspaceMemberId,
      );
      expect(
        await context.chatService.hasMessages({
          workspaceId: context.workspaceId,
          threadId,
        }),
      ).toBe(false);
    } finally {
      if (runner.isTransactionActive) {
        await runner.rollbackTransaction();
      }

      await runner.release();
      await sending;
    }
  });

  it('creates the thread of a new chat on its first message', async () => {
    const threadId = context.registerThread();
    const messageId = randomUUID();
    const response = await sendChatParticipationMessage({
      threadId,
      messageId,
    });

    expect(response.body.errors).toBeUndefined();
    expect((await context.readThread(threadId)).workspaceMemberId).toBe(
      context.workspaceMemberId,
    );
    expect(
      await context.chatService.getMessagesForThread({
        threadId,
        workspaceId: context.workspaceId,
        workspaceMemberId: context.workspaceMemberId,
      }),
    ).toContainEqual(expect.objectContaining({ id: messageId }));
  });

  it('saves a message without starting a turn when the assistant is off', async () => {
    const threadId = await createSharedThread();
    const messageId = randomUUID();
    const response = await sendChatParticipationMessage({
      threadId,
      messageId,
      shouldAssistantReply: false,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sendChatMessage).toMatchObject({
      messageId,
      queued: false,
      streamId: null,
    });
    expect(
      await context.chatService.getMessagesForThread({
        threadId,
        workspaceId: context.workspaceId,
        workspaceMemberId: context.workspaceMemberId,
      }),
    ).toContainEqual(expect.objectContaining({ id: messageId }));
    expect(await readTurnCount(threadId)).toBe(0);
  });

  it('still replies when the assistant is off but the inbox is not enabled', async () => {
    const threadId = await createSharedThread();

    await context.featureFlagService.upsertWorkspaceFeatureFlag({
      workspaceId: context.workspaceId,
      featureFlag: FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
      value: false,
    });
    const response = await sendChatParticipationMessage({
      threadId,
      shouldAssistantReply: false,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sendChatMessage.streamId).toEqual(
      expect.any(String),
    );
  });

  it('allows an authorized stop to be a no-op when the thread is idle', async () => {
    const threadId = await context.createThread();
    const response = await makeMetadataApiRequest({
      query: STOP_STREAM,
      variables: { threadId },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.stopAgentChatStream).toBe(true);
    expect((await context.readThread(threadId)).activeStreamId).toBeNull();
  });
});
