import { EventEmitter, once } from 'node:events';
import { RecordShareAccessLevel } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { AgentChatInboxDeliveryReason } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-inbox-delivery-reason.enum';
import { type AgentChatInboxDeliveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-inbox-delivery.service';
import { type AgentChatThreadParticipantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';
import { type AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { type AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { getAgentHistoryRepositoryToken } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import {
  setUpChatThreadParticipantTests,
  SCHEMA,
  buildFutureSnoozedUntil,
  assign,
  readAssigneeId,
  addParticipants,
  runInboxAction,
  findThreadParticipants,
  findMyParticipant,
  readThreadActivity,
  setShareWithMember,
  setShareWithJony,
} from 'test/integration/graphql/suites/chat-thread-participant/utils/chat-thread-participant-test.util';

describe('Chat thread participant sharing, subscription and assignment through the authenticated API', () => {
  const { createTestThread } = setUpChatThreadParticipantTests();

  it('brings the thread back and marks it read for the member who writes in it', async () => {
    const threadId = await createTestThread();

    await setShareWithJony(threadId, true);
    await runInboxAction('ARCHIVE', threadId, {
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });
    await runInboxAction('ARCHIVE', threadId);
    await runInboxAction('UNREAD', threadId);

    const { lastActivityAt } =
      await getAppProviderByClassName<AgentChatThreadParticipantService>(
        'AgentChatThreadParticipantService',
      ).recordMemberActivity({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        threadId,
        text: 'Can you check the Stripe renewal?',
      });

    const owner = await findMyParticipant(threadId);

    expect(lastActivityAt).not.toBeNull();
    expect(await readThreadActivity(threadId)).toMatchObject({
      lastMessageText: 'Can you check the Stripe renewal?',
      lastMessageSenderWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      writerWorkspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JANE],
    });
    expect(owner).toMatchObject({ archivedAt: null, snoozedUntil: null });
    expect(new Date(owner!.lastReadAt!).getTime()).toBe(
      lastActivityAt!.getTime(),
    );

    // The other member archived before this activity, so it is back in their
    // inbox and unread, without anyone touching their row
    const member = await findMyParticipant(
      threadId,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(new Date(member!.archivedAt!).getTime()).toBeLessThan(
      lastActivityAt!.getTime(),
    );
    expect(member!.lastReadAt).toBeNull();
  });

  it('brings a thread back for its members on activity no member wrote', async () => {
    const threadId = await createTestThread();
    const archived = await runInboxAction('ARCHIVE', threadId);

    expect(archived.body.errors).toBeUndefined();
    expect(
      archived.body.data.updateAgentChatThreadInboxState[0].archivedAt,
    ).not.toBeNull();

    await getAppProviderByClassName<AgentChatThreadService>(
      'AgentChatThreadService',
    ).recordThreadActivity({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      threadId,
      text: 'The renewal is due next week.',
    });

    const owner = await findMyParticipant(threadId);
    const { lastActivityAt, ...lastMessage } =
      await readThreadActivity(threadId);

    expect(lastMessage).toMatchObject({
      lastMessageText: 'The renewal is due next week.',
      lastMessageSenderWorkspaceMemberId: null,
    });

    expect(new Date(owner!.archivedAt!).getTime()).toBeLessThan(
      lastActivityAt.getTime(),
    );
    expect(new Date(owner!.lastReadAt!).getTime()).toBeLessThan(
      lastActivityAt.getTime(),
    );
  });

  it("only lists the caller's own rows", async () => {
    const threadId = await createTestThread();

    await setShareWithJony(threadId, true);
    await runInboxAction('ARCHIVE', threadId, {
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    const rows: { workspaceMemberId: string }[] =
      await global.testDataSource.query(
        `SELECT "workspaceMemberId" FROM ${SCHEMA}."agentChatThreadParticipant" WHERE "threadId" = $1`,
        [threadId],
      );

    expect(rows).toHaveLength(2);
    expect(
      await findThreadParticipants(threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).toEqual([
      expect.objectContaining({
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      }),
    ]);
  });

  it('stops listing a thread once the member loses access to it', async () => {
    const threadId = await createTestThread();

    await setShareWithJony(threadId, true);
    await runInboxAction('ARCHIVE', threadId, {
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(
      await findMyParticipant(threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).toBeDefined();

    await setShareWithJony(threadId, false);

    expect(
      await findMyParticipant(threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).toBeUndefined();
  });

  it('shares the thread with a mentioned member and brings it to their inbox unread', async () => {
    const threadId = await createTestThread();

    expect(
      await findMyParticipant(threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).toBeUndefined();

    expect(
      await addParticipants({
        threadId,
        workspaceMemberIds: [
          WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        ],
      }),
    ).toEqual([WORKSPACE_MEMBER_DATA_SEED_IDS.JONY]);
    expect(
      await findMyParticipant(threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).toMatchObject({ lastReadAt: null, archivedAt: null, snoozedUntil: null });
    expect(
      (await readThreadActivity(threadId)).writerWorkspaceMemberIds,
    ).toEqual([WORKSPACE_MEMBER_DATA_SEED_IDS.JONY]);

    // Editors can mention others too; the owner keeps following as owner
    expect(
      await addParticipants({
        threadId,
        workspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JANE],
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      }),
    ).toEqual([WORKSPACE_MEMBER_DATA_SEED_IDS.JANE]);
    expect(await findMyParticipant(threadId)).toMatchObject({
      lastReadAt: null,
    });
    expect(
      (await readThreadActivity(threadId)).writerWorkspaceMemberIds,
    ).toEqual([WORKSPACE_MEMBER_DATA_SEED_IDS.JONY]);
  });

  it('retains both writers when inbox deliveries update the same thread concurrently', async () => {
    const threadId = await createTestThread();
    const workspaceMemberIds = [
      WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    ];

    for (const workspaceMemberId of workspaceMemberIds) {
      await setShareWithMember({
        threadId,
        workspaceMemberId,
        accessLevel: RecordShareAccessLevel.READ_WRITE,
        enabled: true,
      });
    }

    const threadRepository = global.app.get<
      string,
      AgentHistoryRepository<AgentChatThreadWorkspaceEntity>
    >(getAgentHistoryRepositoryToken('agentChatThread'), { strict: false });
    const updateThread = threadRepository.update.bind(threadRepository);
    const updateEvents = new EventEmitter();
    const WRITER_UPDATES_READY = 'writer-updates-ready';
    const concurrentUpdatesReady = once(updateEvents, WRITER_UPDATES_READY);
    let initialUpdateCount = 0;

    jest
      .spyOn(threadRepository, 'update')
      .mockImplementation(async (...args) => {
        const [workspaceId, criteria, values] = args;
        const isTargetWriterUpdate =
          workspaceId === SEED_APPLE_WORKSPACE_ID &&
          criteria.id === threadId &&
          isDefined(values.writerWorkspaceMemberIds);

        if (!isTargetWriterUpdate || initialUpdateCount >= 2) {
          return updateThread(...args);
        }

        initialUpdateCount += 1;

        if (initialUpdateCount === 2) {
          updateEvents.emit(WRITER_UPDATES_READY);
        }

        await concurrentUpdatesReady;

        return updateThread(...args);
      });

    await Promise.all(
      workspaceMemberIds.map((workspaceMemberId) =>
        getAppProviderByClassName<AgentChatInboxDeliveryService>(
          'AgentChatInboxDeliveryService',
        ).deliverThreadToMemberInboxes({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
          threadId,
          workspaceMemberIds: [workspaceMemberId],
          reason: AgentChatInboxDeliveryReason.RECIPIENT,
        }),
      ),
    );

    expect(
      (await readThreadActivity(threadId)).writerWorkspaceMemberIds?.sort(),
    ).toEqual([...workspaceMemberIds].sort());
  });

  it('brings the thread back unread for a participant who had read and archived it', async () => {
    const threadId = await createTestThread();

    await addParticipants({
      threadId,
      workspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
    });
    await runInboxAction('READ', threadId, {
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });
    await runInboxAction('ARCHIVE', threadId, {
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });
    await addParticipants({
      threadId,
      workspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
    });

    expect(
      await findMyParticipant(threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).toMatchObject({ lastReadAt: null, archivedAt: null, snoozedUntil: null });
    expect(
      (await readThreadActivity(threadId)).writerWorkspaceMemberIds,
    ).toEqual([WORKSPACE_MEMBER_DATA_SEED_IDS.JONY]);
  });

  it('refuses a member who can only read the thread', async () => {
    const threadId = await createTestThread();

    await setShareWithJony(threadId, true);

    await expect(
      addParticipants({
        threadId,
        workspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.TIM],
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      }),
    ).rejects.toMatchObject({ code: AiExceptionCode.THREAD_NOT_FOUND });
    expect(
      (await readThreadActivity(threadId)).writerWorkspaceMemberIds ?? [],
    ).toEqual([]);
  });

  it('leaves out a member who could only read the thread when the sender cannot share it', async () => {
    const threadId = await createTestThread();

    await setShareWithMember({
      threadId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      accessLevel: RecordShareAccessLevel.READ_WRITE,
      enabled: true,
    });
    await setShareWithMember({
      threadId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      accessLevel: RecordShareAccessLevel.READ,
      enabled: true,
    });

    expect(
      await addParticipants({
        threadId,
        workspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.TIM],
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      }),
    ).toEqual([]);
    expect(
      (await readThreadActivity(threadId)).writerWorkspaceMemberIds ?? [],
    ).toEqual([]);
  });

  it('keeps an unsubscribed chat done through new activity', async () => {
    const threadId = await createTestThread();
    const unsubscribed = await runInboxAction('UNSUBSCRIBE', threadId);

    expect(unsubscribed.body.errors).toBeUndefined();
    expect(
      unsubscribed.body.data.updateAgentChatThreadInboxState[0],
    ).toMatchObject({ isSubscribed: false, snoozedUntil: null });
    expect(
      unsubscribed.body.data.updateAgentChatThreadInboxState[0].archivedAt,
    ).not.toBeNull();

    await getAppProviderByClassName<AgentChatThreadService>(
      'AgentChatThreadService',
    ).recordThreadActivity({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      threadId,
      text: 'The renewal went through',
    });

    expect(await findMyParticipant(threadId)).toMatchObject({
      isSubscribed: false,
    });

    // Subscribing again leaves the chat where it is until something happens
    const subscribed = await runInboxAction('SUBSCRIBE', threadId);

    expect(subscribed.body.errors).toBeUndefined();
    expect(
      subscribed.body.data.updateAgentChatThreadInboxState[0],
    ).toMatchObject({
      isSubscribed: true,
      archivedAt:
        unsubscribed.body.data.updateAgentChatThreadInboxState[0].archivedAt,
    });
  });

  it('follows the chat again for a member who reopens, snoozes or writes in it', async () => {
    const threadId = await createTestThread();

    await runInboxAction('UNSUBSCRIBE', threadId);
    await runInboxAction('MOVE_TO_INBOX', threadId);

    expect(await findMyParticipant(threadId)).toMatchObject({
      isSubscribed: true,
      archivedAt: null,
    });

    await runInboxAction('UNSUBSCRIBE', threadId);
    await runInboxAction('SNOOZE', threadId, {
      snoozedUntil: buildFutureSnoozedUntil(),
    });

    expect(await findMyParticipant(threadId)).toMatchObject({
      isSubscribed: true,
    });

    await runInboxAction('UNSUBSCRIBE', threadId);
    await getAppProviderByClassName<AgentChatThreadParticipantService>(
      'AgentChatThreadParticipantService',
    ).recordMemberActivity({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      threadId,
      text: 'Back on this one',
    });

    expect(await findMyParticipant(threadId)).toMatchObject({
      isSubscribed: true,
      archivedAt: null,
    });
  });

  it('follows the chat again and records the mention for a mentioned member who had unsubscribed', async () => {
    const threadId = await createTestThread();

    await addParticipants({
      threadId,
      workspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
    });

    const firstMention = await findMyParticipant(
      threadId,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(firstMention).toMatchObject({ isSubscribed: true });
    expect(firstMention!.lastMentionedAt).not.toBeNull();

    await runInboxAction('UNSUBSCRIBE', threadId, {
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });
    await addParticipants({
      threadId,
      workspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
    });

    const secondMention = await findMyParticipant(
      threadId,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(secondMention).toMatchObject({
      isSubscribed: true,
      archivedAt: null,
      lastReadAt: null,
    });
    expect(new Date(secondMention!.lastMentionedAt!).getTime()).toBeGreaterThan(
      new Date(firstMention!.lastMentionedAt!).getTime(),
    );
  });

  it('assigns a chat to a member who could not read it, who then finds it unread in their inbox', async () => {
    const threadId = await createTestThread();
    const response = await assign(
      threadId,
      WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    );

    expect(response.body.errors).toBeUndefined();
    expect(await readAssigneeId(threadId)).toBe(
      WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    );
    expect(
      await findMyParticipant(threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).toMatchObject({
      isSubscribed: true,
      archivedAt: null,
      lastReadAt: null,
    });
    expect(
      (await readThreadActivity(threadId)).writerWorkspaceMemberIds,
    ).toEqual([WORKSPACE_MEMBER_DATA_SEED_IDS.JONY]);
  });

  it('keeps a chat read for a member who assigns it to themselves', async () => {
    const threadId = await createTestThread();

    await runInboxAction('ARCHIVE', threadId);

    const response = await assign(
      threadId,
      WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    );

    expect(response.body.errors).toBeUndefined();

    const participant = await findMyParticipant(threadId);

    expect(participant).toMatchObject({ archivedAt: null, isSubscribed: true });
    expect(participant!.lastReadAt).not.toBeNull();
    expect(
      (await readThreadActivity(threadId)).writerWorkspaceMemberIds ?? [],
    ).toEqual([]);
  });

  it('keeps the former assignee following the chat once it is unassigned', async () => {
    const threadId = await createTestThread();

    await assign(threadId, WORKSPACE_MEMBER_DATA_SEED_IDS.JONY);

    const response = await assign(threadId, null);

    expect(response.body.errors).toBeUndefined();
    expect(await readAssigneeId(threadId)).toBeNull();
    expect(
      await findMyParticipant(threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).toMatchObject({ isSubscribed: true });
  });

  it('refuses to unsubscribe the assignee', async () => {
    const threadId = await createTestThread();

    await assign(threadId, WORKSPACE_MEMBER_DATA_SEED_IDS.JONY);

    const response = await runInboxAction('UNSUBSCRIBE', threadId, {
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(response.body.errors[0].extensions.code).toBe('CONFLICT');
    expect(
      await findMyParticipant(threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).toMatchObject({ isSubscribed: true });
  });

  it('refuses to assign a chat for a member who can only read it', async () => {
    const threadId = await createTestThread();

    await setShareWithJony(threadId, true);

    const response = await assign(
      threadId,
      WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors[0].extensions.code).toBe('NOT_FOUND');
    expect(await readAssigneeId(threadId)).toBeNull();
  });

  it('refuses an assignee who cannot reply when the caller cannot share the chat', async () => {
    const threadId = await createTestThread();

    await setShareWithMember({
      threadId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      accessLevel: RecordShareAccessLevel.READ_WRITE,
      enabled: true,
    });

    const response = await assign(
      threadId,
      WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
    expect(await readAssigneeId(threadId)).toBeNull();
  });
});
