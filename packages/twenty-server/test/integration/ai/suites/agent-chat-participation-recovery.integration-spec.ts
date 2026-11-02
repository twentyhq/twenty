import { randomUUID } from 'node:crypto';
import { EventEmitter, once } from 'node:events';

import { createChatParticipationTestContext } from 'test/integration/ai/utils/create-chat-participation-test-context.util';
import { runWithRejectedChatWrite } from 'test/integration/ai/utils/run-with-rejected-chat-write.util';
import { waitForBlockedDatabaseQueryOrThrow } from 'test/integration/ai/utils/wait-for-blocked-database-query-or-throw.util';
import { sendChatParticipationMessage } from 'test/integration/graphql/utils/send-chat-participation-message.util';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

import { AiChatAssistantMode } from 'src/engine/core-modules/workspace/enums/ai-chat-assistant-mode.enum';
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
      await context.chatService.hasMessage({
        workspaceId: context.workspaceId,
        workspaceMemberId: context.workspaceMemberId,
        threadId,
        messageId,
      }),
    ).toBe(true);
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
      await context.chatService.hasMessage({
        workspaceId: context.workspaceId,
        workspaceMemberId: context.workspaceMemberId,
        threadId,
        messageId,
      }),
    ).toBe(true);
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

  it('serializes simultaneous initial sends until the first Ada selection and message commit', async () => {
    const threadId = await context.createThread();
    const firstMessageId = randomUUID();
    const secondMessageId = randomUUID();
    const writeEvents = new EventEmitter();
    const writeStarted = once(writeEvents, 'started');
    const writeResumed = once(writeEvents, 'resumed');
    const addMessage = context.chatService.addMessage.bind(context.chatService);

    jest
      .spyOn(context.chatService, 'addMessage')
      .mockImplementation(async (args) => {
        if (args.id !== firstMessageId) {
          return addMessage(args);
        }

        assertIsDefinedOrThrow(args.scope);

        const [{ backendProcessId }] = await args.scope.executeRawQuery(
          'SELECT pg_backend_pid() AS "backendProcessId"',
        );

        writeEvents.emit('started', backendProcessId);
        await writeResumed;

        return addMessage(args);
      });

    const firstSend = sendChatParticipationMessage({
      threadId,
      messageId: firstMessageId,
      isAssistantParticipant: false,
      shouldAssistantReply: false,
      recipientWorkspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
    }).then((response) => response);
    const [blockingProcessId] = await Promise.race([
      writeStarted,
      firstSend.then(() => {
        throw new Error('The first send completed before its message write');
      }),
    ]);
    const secondSend = sendChatParticipationMessage({
      threadId,
      messageId: secondMessageId,
      isAssistantParticipant: true,
      shouldAssistantReply: false,
      recipientWorkspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.TIM],
    }).then((response) => response);

    try {
      await waitForBlockedDatabaseQueryOrThrow(blockingProcessId);

      expect((await context.readThread(threadId)).isAssistantParticipant).toBe(
        true,
      );
      expect(
        await context.chatService.hasMessages({
          workspaceId: context.workspaceId,
          threadId,
        }),
      ).toBe(false);
    } finally {
      writeEvents.emit('resumed');
      await Promise.allSettled([firstSend, secondSend]);
    }

    const [firstResponse, secondResponse] = await Promise.all([
      firstSend,
      secondSend,
    ]);

    expect(firstResponse.body.errors).toBeUndefined();
    expect(secondResponse.body.errors).toBeUndefined();
    expect(
      firstResponse.body.data.sendChatMessage
        .recipientParticipantWorkspaceMemberIds,
    ).toEqual([WORKSPACE_MEMBER_DATA_SEED_IDS.JONY]);
    expect(
      secondResponse.body.data.sendChatMessage
        .recipientParticipantWorkspaceMemberIds,
    ).toEqual([]);
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
    const participantIds = (await context.readParticipants(threadId)).map(
      ({ workspaceMemberId }) => workspaceMemberId,
    );

    expect(participantIds).toContain(WORKSPACE_MEMBER_DATA_SEED_IDS.JONY);
    expect(participantIds).not.toContain(WORKSPACE_MEMBER_DATA_SEED_IDS.TIM);
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
