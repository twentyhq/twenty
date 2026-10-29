import { randomUUID } from 'node:crypto';

import { createChatParticipationTestContext } from 'test/integration/ai/utils/create-chat-participation-test-context.util';
import { RecordShareAccessLevel } from 'twenty-shared/types';

import { AiChatAssistantMode } from 'src/engine/core-modules/workspace/enums/ai-chat-assistant-mode.enum';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const MESSAGE_LOCK_CONTENTION_HOLD_MS = 6_000;

describe('Chat participation acceptance and recovery with real storage', () => {
  let context: Awaited<ReturnType<typeof createChatParticipationTestContext>>;

  beforeEach(async () => {
    context = await createChatParticipationTestContext();
  });

  afterEach(async () => {
    await context.cleanup();
  });

  const participationArguments = (threadId: string) => ({
    workspaceId: context.workspaceId,
    workspaceMemberId: context.workspaceMemberId,
    threadId,
    messageId: randomUUID(),
    isAssistantMentioned: false,
    recipientWorkspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
  });

  it('does not deliver recipients when a failed send never stored its message', async () => {
    const threadId = await context.createThread(false);

    await context.participationService.completeMessage(
      participationArguments(threadId),
    );

    expect(await context.readParticipants(threadId)).toEqual([
      expect.objectContaining({ workspaceMemberId: context.workspaceMemberId }),
    ]);
    expect((await context.readThread(threadId)).isAssistantParticipant).toBe(
      false,
    );
  });

  it('recovers recipient delivery after a human message was already accepted', async () => {
    const threadId = await context.createThread(false);
    const message = await context.saveMessage({ threadId });
    const messageArguments = {
      ...participationArguments(threadId),
      messageId: message.id,
    };

    await context.participationService.completeMessage(messageArguments);
    await context.participationService.completeMessage(messageArguments);

    const recipients = (await context.readParticipants(threadId)).filter(
      ({ workspaceMemberId }) =>
        workspaceMemberId === WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    );

    expect(recipients).toEqual([
      expect.objectContaining({
        archivedAt: null,
        isSubscribed: true,
        lastMentionedAt: null,
      }),
    ]);
  });

  it('preserves a later Ada join and refuses new recipients on first-message replay', async () => {
    const threadId = await context.createThread(false);
    const firstMessage = await context.saveMessage({ threadId });
    const secondMessage = await context.saveMessage({ threadId });

    await context.participationService.completeMessage({
      ...participationArguments(threadId),
      messageId: secondMessage.id,
      isAssistantMentioned: true,
      recipientWorkspaceMemberIds: [],
    });
    await expect(
      context.participationService.completeMessage({
        ...participationArguments(threadId),
        messageId: firstMessage.id,
        recipientWorkspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.TIM],
      }),
    ).resolves.toEqual([]);

    expect((await context.readThread(threadId)).isAssistantParticipant).toBe(
      true,
    );
    expect(await context.readParticipants(threadId)).not.toContainEqual(
      expect.objectContaining({
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      }),
    );
  });

  it('does not complete participation using another member’s accepted message', async () => {
    const threadId = await context.createThread(false);
    const message = await context.saveMessage({ threadId });

    await context.share({
      threadId,
      recipientWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      accessLevel: RecordShareAccessLevel.READ_WRITE,
    });
    await expect(
      context.participationService.completeMessage({
        ...participationArguments(threadId),
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        messageId: message.id,
        isAssistantMentioned: true,
        recipientWorkspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.TIM],
      }),
    ).resolves.toEqual([]);

    expect((await context.readThread(threadId)).isAssistantParticipant).toBe(
      false,
    );
    expect(await context.readParticipants(threadId)).not.toContainEqual(
      expect.objectContaining({
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      }),
    );
  });

  it('rechecks Never during participation recovery without removing the accepted message', async () => {
    const threadId = await context.createThread(false);

    await context.setConversationType({
      threadId,
      conversationType: 'DIRECT_MESSAGE',
    });
    const message = await context.saveMessage({ threadId });
    const messageArguments = {
      ...participationArguments(threadId),
      messageId: message.id,
      isAssistantMentioned: true,
      recipientWorkspaceMemberIds: [],
    };

    await context.participationService.completeMessage(messageArguments);
    expect((await context.readThread(threadId)).isAssistantParticipant).toBe(
      true,
    );
    await context.setAssistantModes({
      aiChatDirectMessageAssistantMode: AiChatAssistantMode.NEVER,
    });
    await context.participationService.completeMessage(messageArguments);

    expect((await context.readThread(threadId)).isAssistantParticipant).toBe(
      false,
    );
    expect(
      await context.chatService.hasMessage({
        workspaceId: context.workspaceId,
        workspaceMemberId: context.workspaceMemberId,
        threadId,
        messageId: message.id,
      }),
    ).toBe(true);
  });

  it('holds another send until the first Ada selection and message are stored', async () => {
    const threadId = await context.createThread();

    await context.threadService.deliverToParticipants({
      workspaceId: context.workspaceId,
      workspaceMemberId: context.workspaceMemberId,
      threadId,
      participantWorkspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
    });
    const controls: {
      release: () => void;
      markEntered: () => void;
      hasSecondSendEntered: boolean;
    } = {
      release: () => undefined,
      markEntered: () => undefined,
      hasSecondSendEntered: false,
    };
    const released = new Promise<void>((resolve) => {
      controls.release = resolve;
    });
    const entered = new Promise<void>((resolve) => {
      controls.markEntered = resolve;
    });
    const lockArguments = { workspaceId: context.workspaceId, threadId };
    const firstSend = context.participationService.runWithMessageLock({
      ...lockArguments,
      work: async () => {
        controls.markEntered();
        await released;
        await context.threadService.applyAssistantParticipation({
          ...lockArguments,
          workspaceMemberId: context.workspaceMemberId,
          initialIsAssistantParticipant: false,
        });
        await context.saveMessage({ threadId });
      },
    });

    await entered;
    const secondSend = context.participationService
      .runWithMessageLock({
        ...lockArguments,
        work: async () => {
          controls.hasSecondSendEntered = true;

          return context.threadService.getWritableThread({
            ...lockArguments,
            workspaceMemberId: context.workspaceMemberId,
          });
        },
      })
      .catch((error: unknown) => error);

    try {
      await new Promise((resolve) =>
        setTimeout(resolve, MESSAGE_LOCK_CONTENTION_HOLD_MS),
      );
      expect(controls.hasSecondSendEntered).toBe(false);
    } finally {
      controls.release();
    }

    await firstSend;
    await expect(secondSend).resolves.toMatchObject({
      isAssistantParticipant: false,
    });
  });
});
