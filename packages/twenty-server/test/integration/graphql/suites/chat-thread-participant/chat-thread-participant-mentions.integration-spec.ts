import { randomUUID } from 'node:crypto';
import { EventEmitter, once } from 'node:events';
import { waitForBlockedDatabaseQueryOrThrow } from 'test/integration/ai/utils/wait-for-blocked-database-query-or-throw.util';
import { writeChatMemberMessage } from 'test/integration/ai/utils/write-chat-member-message.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { AgentChatInboxDeliveryReason } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-inbox-delivery-reason.enum';
import { AgentChatMemberMessagePlacement } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-member-message-placement.enum';
import { type AgentChatInboxDeliveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-inbox-delivery.service';
import { type AgentChatQueueService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-queue.service';
import { type AgentChatThreadParticipantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { type AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import {
  setUpChatThreadParticipantTests,
  SCHEMA,
  buildJonyThreadAccess,
  buildFutureSnoozedUntil,
  assign,
  addParticipants,
  findOpenThreadsSummary,
  runInboxAction,
  findMyParticipant,
  setShareWithJony,
} from 'test/integration/graphql/suites/chat-thread-participant/utils/chat-thread-participant-test.util';

describe('Chat thread participant mentions through the authenticated API', () => {
  const { createTestThread } = setUpChatThreadParticipantTests();

  // Other tests' chats may stay open for the member, so counts are compared
  // with what they were before
  it('summarizes the open chats the member follows, from their own rows', async () => {
    const before = await findOpenThreadsSummary();
    const threadId = await createTestThread();

    expect(await findOpenThreadsSummary()).toEqual(before);

    await setShareWithJony(threadId, true);
    await global.testDataSource.query(
      `UPDATE ${SCHEMA}."agentChatThread" SET "pendingQuestionMessageId" = $2 WHERE id = $1`,
      [threadId, randomUUID()],
    );

    // Being able to open a chat, reading it or marking it unread does not
    // follow it
    expect(await findOpenThreadsSummary()).toEqual(before);

    for (const action of ['UNREAD', 'READ'] as const) {
      await runInboxAction(action, threadId, {
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      });

      expect(await findOpenThreadsSummary()).toEqual(before);
    }

    await runInboxAction('SUBSCRIBE', threadId, {
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(await findOpenThreadsSummary()).toMatchObject({
      openThreadCount: before.openThreadCount + 1,
      unreadOpenThreadCount: before.unreadOpenThreadCount,
      needsInputThreadCount: before.needsInputThreadCount + 1,
      hasUnreadOpenThread: before.hasUnreadOpenThread,
    });

    await runInboxAction('UNREAD', threadId, {
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(await findOpenThreadsSummary()).toMatchObject({
      openThreadCount: before.openThreadCount + 1,
      unreadOpenThreadCount: before.unreadOpenThreadCount + 1,
      hasUnreadOpenThread: true,
    });

    await runInboxAction('READ', threadId, {
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(await findOpenThreadsSummary()).toMatchObject({
      openThreadCount: before.openThreadCount + 1,
      unreadOpenThreadCount: before.unreadOpenThreadCount,
      hasUnreadOpenThread: before.hasUnreadOpenThread,
    });

    await runInboxAction('UNREAD', threadId, {
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    await runInboxAction('ARCHIVE', threadId, {
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(await findOpenThreadsSummary()).toEqual(before);
  });

  it('flags the open chats the member was mentioned in or assigned that are unread', async () => {
    const initialSummary = await findOpenThreadsSummary();
    const mentionedThreadId = await createTestThread();
    const assignedThreadId = await createTestThread();

    await addParticipants({
      threadId: mentionedThreadId,
      workspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
    });
    await assign(assignedThreadId, WORKSPACE_MEMBER_DATA_SEED_IDS.JONY);

    expect(await findOpenThreadsSummary()).toMatchObject({
      unreadOpenThreadCount: initialSummary.unreadOpenThreadCount + 2,
      hasUnreadMentionThread: true,
      hasUnreadAssignedThread: true,
    });

    const unsubscribed = await runInboxAction(
      'UNSUBSCRIBE',
      mentionedThreadId,
      { token: APPLE_JONY_MEMBER_ACCESS_TOKEN },
    );

    expect(unsubscribed.body.errors).toBeUndefined();

    await runInboxAction('ARCHIVE', assignedThreadId, {
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    const before = await findOpenThreadsSummary();

    expect(before.unreadOpenThreadCount).toBe(
      initialSummary.unreadOpenThreadCount,
    );

    // Activity brings back a chat filed under done, but not one the member left
    await global.testDataSource.query(
      `UPDATE ${SCHEMA}."agentChatThread" SET "lastActivityAt" = clock_timestamp() WHERE id = ANY($1)`,
      [[mentionedThreadId, assignedThreadId]],
    );

    expect(await findOpenThreadsSummary()).toMatchObject({
      openThreadCount: before.openThreadCount + 1,
      unreadOpenThreadCount: before.unreadOpenThreadCount + 1,
    });
  });

  it('resolves the mention when the member reads the chat and keeps it when they mark it unread', async () => {
    const threadId = await createTestThread();

    await addParticipants({
      threadId,
      workspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
    });

    for (const action of ['READ', 'UNREAD']) {
      const response = await runInboxAction(action, threadId, {
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      });
      const participant = response.body.data.updateAgentChatThreadInboxState[0];

      expect(response.body.errors).toBeUndefined();
      expect(participant.mentionsResolvedAt).toBe(participant.lastMentionedAt);
    }
  });

  it('preserves unresolved mentions while marking unread and snoozing', async () => {
    const threadId = await createTestThread();

    await addParticipants({
      threadId,
      workspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
    });

    for (const action of ['UNREAD', 'SNOOZE']) {
      const response = await runInboxAction(action, threadId, {
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
        snoozedUntil:
          action === 'SNOOZE' ? buildFutureSnoozedUntil() : undefined,
      });

      expect(response.body.errors).toBeUndefined();
      expect(
        response.body.data.updateAgentChatThreadInboxState[0],
      ).toMatchObject({
        lastMentionedAt: expect.any(String),
        mentionsResolvedAt: null,
      });
    }
  });

  it('resolves only the member who successfully sends a reply', async () => {
    const threadId = await createTestThread();

    await addParticipants({
      threadId,
      workspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
    });
    await addParticipants({
      threadId,
      workspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JANE],
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    });

    await writeChatMemberMessage({
      actor: {
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
      },
      thread: await getAppProviderByClassName<AgentChatThreadService>(
        'AgentChatThreadService',
      ).getWritableThread(buildJonyThreadAccess(threadId)),
      message: { text: 'I have handled this.' },
      placement: AgentChatMemberMessagePlacement.RUNNING,
    });

    const repliedParticipant = await findMyParticipant(
      threadId,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(repliedParticipant!.mentionsResolvedAt).toBe(
      repliedParticipant!.lastMentionedAt,
    );
    expect(await findMyParticipant(threadId)).toMatchObject({
      lastMentionedAt: expect.any(String),
      mentionsResolvedAt: null,
    });
  });

  it('keeps a mention resolved after Done until an explicit new mention arrives', async () => {
    const threadId = await createTestThread();

    await addParticipants({
      threadId,
      workspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
    });
    await runInboxAction('ARCHIVE', threadId, {
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    const doneParticipant = await findMyParticipant(
      threadId,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(doneParticipant!.mentionsResolvedAt).toBe(
      doneParticipant!.lastMentionedAt,
    );

    await getAppProviderByClassName<AgentChatThreadService>(
      'AgentChatThreadService',
    ).recordThreadActivity({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      threadId,
      text: 'An unrelated update',
    });
    await runInboxAction('MOVE_TO_INBOX', threadId, {
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(
      await findMyParticipant(threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).toMatchObject({
      lastMentionedAt: doneParticipant!.lastMentionedAt,
      mentionsResolvedAt: doneParticipant!.mentionsResolvedAt,
    });

    await addParticipants({
      threadId,
      workspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
    });

    const mentionedAgain = await findMyParticipant(
      threadId,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(
      new Date(mentionedAgain!.lastMentionedAt!).getTime(),
    ).toBeGreaterThan(new Date(mentionedAgain!.mentionsResolvedAt!).getTime());
  });

  it('resolves a mention when the member unsubscribes', async () => {
    const threadId = await createTestThread();

    await addParticipants({
      threadId,
      workspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
    });
    await runInboxAction('UNSUBSCRIBE', threadId, {
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    const unsubscribedParticipant = await findMyParticipant(
      threadId,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(unsubscribedParticipant).toMatchObject({
      isSubscribed: false,
      mentionsResolvedAt: unsubscribedParticipant!.lastMentionedAt,
    });
  });

  describe('queued replies to a mention', () => {
    const queueReply = async (threadId: string) =>
      writeChatMemberMessage({
        actor: {
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
        },
        thread: await getAppProviderByClassName<AgentChatThreadService>(
          'AgentChatThreadService',
        ).getWritableThread(buildJonyThreadAccess(threadId)),
        message: { text: 'On it' },
        placement: AgentChatMemberMessagePlacement.QUEUED,
      });

    const deleteQueuedReply = (messageId: string) =>
      getAppProviderByClassName<AgentChatQueueService>(
        'AgentChatQueueService',
      ).deleteQueuedMessage({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        messageId,
      });

    it('resolves the mention when the member queues a reply and keeps it after the reply is deleted', async () => {
      const threadId = await createTestThread();

      await addParticipants({
        threadId,
        workspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
      });

      const reply = await queueReply(threadId);
      const repliedParticipant = await findMyParticipant(
        threadId,
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );

      expect(repliedParticipant!.mentionsResolvedAt).toBe(
        repliedParticipant!.lastMentionedAt,
      );

      await deleteQueuedReply(reply.id);

      expect(
        await findMyParticipant(threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
      ).toMatchObject({
        mentionsResolvedAt: repliedParticipant!.lastMentionedAt,
      });
    });

    it('queues a reply while another write of the member locks the chat', async () => {
      const threadId = await createTestThread();

      await addParticipants({
        threadId,
        workspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
      });

      const writeEvents = new EventEmitter();
      const writeStarted = once(writeEvents, 'started');
      const writeResumed = once(writeEvents, 'resumed');
      const write =
        getAppProviderByClassName<AgentChatThreadParticipantService>(
          'AgentChatThreadParticipantService',
        ).resolveMention({
          ...buildJonyThreadAccess(threadId),
          writeResponse: async ({ manager, table }) => {
            const [{ backendProcessId }] = await manager.query<
              { backendProcessId: number }[]
            >('SELECT pg_backend_pid() AS "backendProcessId"');

            writeEvents.emit('started', backendProcessId);
            await writeResumed;
            await manager.query(
              `SELECT id FROM ${table('agentChatThread')} WHERE id = $1 FOR UPDATE`,
              [threadId],
            );
          },
        });

      const [blockingProcessId] = await writeStarted;
      const reply = queueReply(threadId);

      await waitForBlockedDatabaseQueryOrThrow(blockingProcessId);
      writeEvents.emit('resumed');

      await expect(Promise.all([write, reply])).resolves.toEqual([
        undefined,
        expect.objectContaining({ threadId }),
      ]);
    });
  });

  it('delivers app recipients without creating or clearing an explicit mention', async () => {
    const threadId = await createTestThread();
    const inboxDeliveryService =
      getAppProviderByClassName<AgentChatInboxDeliveryService>(
        'AgentChatInboxDeliveryService',
      );
    const delivery = {
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      threadId,
      workspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
      reason: AgentChatInboxDeliveryReason.RECIPIENT,
    };

    await inboxDeliveryService.deliverThreadToMemberInboxes(delivery);

    expect(
      await findMyParticipant(threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).toMatchObject({
      isSubscribed: true,
      lastReadAt: null,
      lastMentionedAt: null,
      mentionsResolvedAt: null,
    });

    await addParticipants({
      threadId,
      workspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
    });

    const mentionedParticipant = await findMyParticipant(
      threadId,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    await inboxDeliveryService.deliverThreadToMemberInboxes(delivery);

    expect(
      await findMyParticipant(threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).toMatchObject({
      lastMentionedAt: mentionedParticipant!.lastMentionedAt,
      mentionsResolvedAt: null,
    });
  });

  it('rolls mention resolution back when a response cannot be recorded', async () => {
    const threadId = await createTestThread();

    await addParticipants({
      threadId,
      workspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
    });

    await expect(
      getAppProviderByClassName<AgentChatThreadParticipantService>(
        'AgentChatThreadParticipantService',
      ).resolveMention({
        ...buildJonyThreadAccess(threadId),
        writeResponse: async () => {
          throw new Error('The response is invalid');
        },
      }),
    ).rejects.toThrow('The response is invalid');

    expect(
      await findMyParticipant(threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).toMatchObject({ mentionsResolvedAt: null });
  });

  it('preserves a newer mention when an older response finishes first', async () => {
    const threadId = await createTestThread();

    await addParticipants({
      threadId,
      workspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
    });

    const responseEvents = new EventEmitter();
    const responseStarted = once(responseEvents, 'started');
    const responseFinished = once(responseEvents, 'finished');
    const participantService =
      getAppProviderByClassName<AgentChatThreadParticipantService>(
        'AgentChatThreadParticipantService',
      );
    const response = participantService.resolveMention({
      ...buildJonyThreadAccess(threadId),
      writeResponse: async () => {
        responseEvents.emit('started');
        await responseFinished;
      },
    });

    await responseStarted;

    const laterMention = addParticipants({
      threadId,
      workspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
    });

    responseEvents.emit('finished');
    await Promise.all([response, laterMention]);

    const participant = await findMyParticipant(
      threadId,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(new Date(participant!.lastMentionedAt!).getTime()).toBeGreaterThan(
      new Date(participant!.mentionsResolvedAt!).getTime(),
    );
  });

  it('orders a new mention after the resolved cursor at millisecond precision', async () => {
    const threadId = await createTestThread();
    const resolvedAt = new Date(Date.now() + 60_000).toISOString();

    await addParticipants({
      threadId,
      workspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
    });
    await global.testDataSource.query(
      `UPDATE ${SCHEMA}."agentChatThreadParticipant"
       SET "lastMentionedAt" = $3, "mentionsResolvedAt" = $3
       WHERE "threadId" = $1 AND "workspaceMemberId" = $2`,
      [threadId, WORKSPACE_MEMBER_DATA_SEED_IDS.JONY, resolvedAt],
    );
    await addParticipants({
      threadId,
      workspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
    });

    const participant = await findMyParticipant(
      threadId,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(new Date(participant!.lastMentionedAt!).getTime()).toBe(
      new Date(resolvedAt).getTime() + 1,
    );
  });
});
