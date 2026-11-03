import { randomUUID } from 'node:crypto';
import { EventEmitter, once } from 'node:events';

import { isArray } from '@sniptt/guards';
import { createChatParticipationTestContext } from 'test/integration/ai/utils/create-chat-participation-test-context.util';
import { runWithRejectedChatWrite } from 'test/integration/ai/utils/run-with-rejected-chat-write.util';
import { sendChatParticipationMessage } from 'test/integration/graphql/utils/send-chat-participation-message.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { RecordShareAccessLevel } from 'twenty-shared/types';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { type CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { AiChatAssistantMode } from 'src/engine/core-modules/workspace/enums/ai-chat-assistant-mode.enum';
import { AgentChatInboxAction } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-inbox-action.enum';
import { type AgentChatThreadParticipantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';
import { type AgentChatThreadParticipantRow } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-participant-row.type';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

describe('Chat message participation with real storage', () => {
  let context: Awaited<ReturnType<typeof createChatParticipationTestContext>>;

  beforeEach(async () => {
    context = await createChatParticipationTestContext();
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    if (isDefined(context)) {
      await context.cleanup();
    }
  });

  it('rolls back the Ada selection and turn when storing the message fails', async () => {
    const threadId = await context.createThread(false);
    const messageId = randomUUID();

    await context.setConversationType({
      threadId,
      conversationType: 'DIRECT_MESSAGE',
    });
    const response = await runWithRejectedChatWrite({
      workspaceId: context.workspaceId,
      threadId,
      operation: 'message',
      work: async () =>
        sendChatParticipationMessage({
          threadId,
          messageId,
          isAssistantMentioned: true,
          shouldAssistantReply: false,
          recipientWorkspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
        }),
    });

    expect(response.body.errors).toBeDefined();
    expect((await context.readThread(threadId)).isAssistantParticipant).toBe(
      false,
    );
    expect(
      await global.testDataSource.query(
        `SELECT id FROM "${context.schema}"."agentMessage" WHERE "threadId" = $1`,
        [threadId],
      ),
    ).toEqual([]);
    expect(
      await global.testDataSource.query(
        `SELECT id FROM "${context.schema}"."agentTurn" WHERE "threadId" = $1`,
        [threadId],
      ),
    ).toEqual([]);
    expect(await context.readParticipants(threadId)).toEqual([
      expect.objectContaining({ workspaceMemberId: context.workspaceMemberId }),
    ]);
  });

  it('keeps the accepted message and Ada selection when initial recipient delivery fails', async () => {
    const threadId = await context.createThread();
    const messageId = randomUUID();
    const response = await runWithRejectedChatWrite({
      workspaceId: context.workspaceId,
      threadId,
      operation: 'share',
      work: async () =>
        sendChatParticipationMessage({
          threadId,
          messageId,
          isAssistantParticipant: false,
          shouldAssistantReply: false,
          recipientWorkspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
        }),
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sendChatMessage).toMatchObject({
      messageId,
      queued: false,
      recipientParticipantWorkspaceMemberIds: [],
    });
    expect((await context.readThread(threadId)).isAssistantParticipant).toBe(
      false,
    );
    expect(
      await context.chatService.getMessagesForThread({
        workspaceId: context.workspaceId,
        workspaceMemberId: context.workspaceMemberId,
        threadId,
      }),
    ).toContainEqual(expect.objectContaining({ id: messageId }));
    expect(await context.readParticipants(threadId)).not.toContainEqual(
      expect.objectContaining({
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      }),
    );
  });

  it('delivers valid initial recipients when sharing with a mentioned member fails', async () => {
    const threadId = await context.createThread();
    const messageId = randomUUID();
    const response = await runWithRejectedChatWrite({
      workspaceId: context.workspaceId,
      threadId,
      operation: 'share',
      principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      work: async () =>
        sendChatParticipationMessage({
          threadId,
          messageId,
          isAssistantParticipant: false,
          shouldAssistantReply: false,
          mentionedWorkspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
          recipientWorkspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.TIM],
        }),
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sendChatMessage).toMatchObject({
      messageId,
      queued: false,
      mentionedParticipantWorkspaceMemberIds: [],
      recipientParticipantWorkspaceMemberIds: [
        WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      ],
    });
    expect(
      await context.chatService.getMessagesForThread({
        workspaceId: context.workspaceId,
        workspaceMemberId: context.workspaceMemberId,
        threadId,
      }),
    ).toContainEqual(expect.objectContaining({ id: messageId }));
    const participants = await context.readParticipants(threadId);

    expect(participants).toContainEqual(
      expect.objectContaining({
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
        lastReadAt: null,
        lastMentionedAt: null,
        isSubscribed: true,
      }),
    );
    expect(participants).not.toContainEqual(
      expect.objectContaining({
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      }),
    );
  });

  it('mentions a participant created by an inbox action after delivery read the missing row', async () => {
    const threadId = await context.createThread();
    const participantService =
      getAppProviderByClassName<AgentChatThreadParticipantService>(
        'AgentChatThreadParticipantService',
      );
    const emitter = getAppProviderByClassName<WorkspaceEventEmitter>(
      'WorkspaceEventEmitter',
    );
    const workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );
    const recipientWorkspaceMemberId = WORKSPACE_MEMBER_DATA_SEED_IDS.JONY;

    for (const workspaceMemberId of [
      recipientWorkspaceMemberId,
      WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    ]) {
      await context.share({
        threadId,
        recipientWorkspaceMemberId: workspaceMemberId,
        accessLevel: RecordShareAccessLevel.READ_WRITE,
      });
    }

    const participantRepository =
      await workspaceOrmManager.executeInWorkspaceContext(
        () =>
          workspaceOrmManager.getRepositoryWithoutPermissionChecks(
            'agentChatThreadParticipant',
          ),
        await context.sharingService.getAuthContext(context),
      );
    const repositoryPrototype: WorkspaceRepository = Object.getPrototypeOf(
      participantRepository,
    );
    const emit = jest.spyOn(emitter, 'emitDatabaseBatchEvent');
    const insert = repositoryPrototype.insert;
    let concurrentParticipantId: string | undefined;

    jest
      .spyOn(repositoryPrototype, 'insert')
      .mockImplementation(async function (
        this: WorkspaceRepository,
        ...insertArgs
      ) {
        const [values] = insertArgs;
        const records = isArray(values) ? values : [values];
        const includesRecipient = records.some(
          (record) =>
            record.threadId === threadId &&
            record.workspaceMemberId === recipientWorkspaceMemberId,
        );

        if (isDefined(concurrentParticipantId) || !includesRecipient) {
          return insert.apply(this, insertArgs);
        }

        const [participant] = await participantService.updateInboxState({
          workspaceId: context.workspaceId,
          workspaceMemberId: recipientWorkspaceMemberId,
          threadIds: [threadId],
          action: AgentChatInboxAction.ARCHIVE,
          snoozedUntil: null,
        });

        concurrentParticipantId = participant.id;

        return insert.apply(this, insertArgs);
      });

    const response = await sendChatParticipationMessage({
      threadId,
      shouldAssistantReply: false,
      mentionedWorkspaceMemberIds: [
        recipientWorkspaceMemberId,
        WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      ],
    });

    expect(response.body.errors).toBeUndefined();
    expect(
      response.body.data.sendChatMessage.mentionedParticipantWorkspaceMemberIds,
    ).toEqual([recipientWorkspaceMemberId, WORKSPACE_MEMBER_DATA_SEED_IDS.TIM]);
    assertIsDefinedOrThrow(concurrentParticipantId);

    const participants = await global.testDataSource.query<
      AgentChatThreadParticipantRow[]
    >(
      `SELECT * FROM "${context.schema}"."agentChatThreadParticipant" WHERE "threadId" = $1`,
      [threadId],
    );

    for (const workspaceMemberId of [
      recipientWorkspaceMemberId,
      WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    ]) {
      const participant = participants.find(
        (row) => row.workspaceMemberId === workspaceMemberId,
      );

      expect(participant).toMatchObject({
        lastReadAt: null,
        archivedAt: null,
        isSubscribed: true,
        lastMentionedAt: expect.anything(),
      });
      assertIsDefinedOrThrow(participant);

      const actions = emit.mock.calls
        .filter(
          ([event]) =>
            isDefined(event) &&
            event.objectMetadataNameSingular === 'agentChatThreadParticipant' &&
            event.events.some(({ recordId }) => recordId === participant.id),
        )
        .map(([event]) => event?.action);

      expect(actions).toEqual(
        participant.id === concurrentParticipantId
          ? [DatabaseEventAction.CREATED, DatabaseEventAction.UPDATED]
          : [DatabaseEventAction.CREATED],
      );
    }
  });

  it('keeps Ada out when a send overlaps the mention delivery of the first message', async () => {
    const threadId = await context.createThread();
    const cacheLockService =
      getAppProviderByClassName<CacheLockService>('CacheLockService');
    const withLock = cacheLockService.withLock.bind(cacheLockService);
    const mentionParticipants = context.threadService.mentionParticipants.bind(
      context.threadService,
    );
    const sendEvents = new EventEmitter();
    const deliveryStarted = once(sendEvents, 'delivery-started');
    const deliveryResumed = once(sendEvents, 'delivery-resumed');
    const secondSendReachedLock = once(sendEvents, 'second-send-reached-lock');
    let threadLockCount = 0;

    jest
      .spyOn(cacheLockService, 'withLock')
      .mockImplementation((work, key, options) => {
        if (key.endsWith(threadId)) {
          threadLockCount += 1;

          if (threadLockCount === 2) {
            sendEvents.emit('second-send-reached-lock');
          }
        }

        return withLock(work, key, options);
      });
    jest
      .spyOn(context.threadService, 'mentionParticipants')
      .mockImplementation(async (delivery) => {
        sendEvents.emit('delivery-started');
        await deliveryResumed;

        return mentionParticipants(delivery);
      });

    const firstSend = sendChatParticipationMessage({
      threadId,
      isAssistantParticipant: false,
      shouldAssistantReply: false,
      mentionedWorkspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
    }).then((response) => response);

    await Promise.race([
      deliveryStarted,
      firstSend.then(() => {
        throw new Error('The first send finished before its mention delivery');
      }),
    ]);

    const secondSend = sendChatParticipationMessage({
      threadId,
      shouldAssistantReply: false,
    }).then((response) => response);

    try {
      await Promise.race([secondSendReachedLock, secondSend]);
    } finally {
      sendEvents.emit('delivery-resumed');
    }

    const [firstResponse, secondResponse] = await Promise.all([
      firstSend,
      secondSend,
    ]);

    expect(firstResponse.body.errors).toBeUndefined();
    expect(secondResponse.body.errors).toBeUndefined();
    expect((await context.readThread(threadId)).isAssistantParticipant).toBe(
      false,
    );
  });

  it('applies Never on a later accepted message without removing earlier messages', async () => {
    const threadId = await context.createThread(false);
    const firstMessageId = randomUUID();
    const secondMessageId = randomUUID();

    await context.setConversationType({
      threadId,
      conversationType: 'DIRECT_MESSAGE',
    });
    const firstResponse = await sendChatParticipationMessage({
      threadId,
      messageId: firstMessageId,
      isAssistantMentioned: true,
      shouldAssistantReply: false,
    });

    expect(firstResponse.body.errors).toBeUndefined();
    expect((await context.readThread(threadId)).isAssistantParticipant).toBe(
      true,
    );
    await context.setAssistantModes({
      aiChatDirectMessageAssistantMode: AiChatAssistantMode.NEVER,
    });
    const secondResponse = await sendChatParticipationMessage({
      threadId,
      messageId: secondMessageId,
      isAssistantMentioned: true,
      shouldAssistantReply: false,
    });

    expect(secondResponse.body.errors).toBeUndefined();
    expect((await context.readThread(threadId)).isAssistantParticipant).toBe(
      false,
    );
    expect(
      await global.testDataSource.query(
        `SELECT id FROM "${context.schema}"."agentMessage" WHERE "threadId" = $1`,
        [threadId],
      ),
    ).toEqual(
      expect.arrayContaining([{ id: firstMessageId }, { id: secondMessageId }]),
    );
  });
});
