import { randomUUID } from 'node:crypto';

import { configureChatParticipationModels } from 'test/integration/ai/utils/configure-chat-participation-models.util';
import { createChatParticipationTestContext } from 'test/integration/ai/utils/create-chat-participation-test-context.util';
import { sendChatParticipationMessage } from 'test/integration/graphql/utils/send-chat-participation-message.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { FeatureFlagKey, RecordShareAccessLevel } from 'twenty-shared/types';

import { AiChatAssistantMode } from 'src/engine/core-modules/workspace/enums/ai-chat-assistant-mode.enum';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

describe('Chat participation through the authenticated API', () => {
  let context: Awaited<ReturnType<typeof createChatParticipationTestContext>>;
  let models: ReturnType<typeof configureChatParticipationModels>;

  beforeEach(async () => {
    context = await createChatParticipationTestContext();
    models = configureChatParticipationModels();
  });

  afterEach(async () => {
    await context.cleanup();
    models.restore();
    jest.restoreAllMocks();
  });

  it('defaults a new direct chat to Ada and starts a reply', async () => {
    const threadId = context.registerThread();
    const response = await sendChatParticipationMessage({ threadId });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sendChatMessage.streamId).toEqual(
      expect.any(String),
    );
    expect(await context.readThread(threadId)).toMatchObject({
      isAssistantParticipant: true,
      workspaceMemberId: context.workspaceMemberId,
    });
  });

  const addJonyAsParticipant = (threadId: string) =>
    context.threadService.deliverToParticipants({
      workspaceId: context.workspaceId,
      workspaceMemberId: context.workspaceMemberId,
      threadId,
      participantWorkspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
    });
  const createDirectMessage = async () => {
    const threadId = await context.createThread();

    await context.setConversationType({
      threadId,
      conversationType: 'DIRECT_MESSAGE',
    });
    await addJonyAsParticipant(threadId);

    return threadId;
  };

  it('applies a mention once when the send succeeds', async () => {
    const threadId = await createDirectMessage();
    const addAssistantParticipant = jest.spyOn(
      context.threadService,
      'addAssistantParticipant',
    );
    const response = await sendChatParticipationMessage({
      threadId,
      isAssistantMentioned: true,
    });

    expect(response.body.errors).toBeUndefined();
    expect((await context.readThread(threadId)).isAssistantParticipant).toBe(
      true,
    );
    expect(addAssistantParticipant).not.toHaveBeenCalled();
  });

  it('keeps a canonical DM mention-only after Ada first joins', async () => {
    models.enableEvaluation();
    const threadId = await createDirectMessage();
    const excluded = await sendChatParticipationMessage({
      threadId,
      isAssistantParticipant: true,
    });

    expect(excluded.body.errors).toBeUndefined();
    expect(excluded.body.data.sendChatMessage.streamId).toBeNull();
    expect((await context.readThread(threadId)).isAssistantParticipant).toBe(
      false,
    );

    const mentioned = await sendChatParticipationMessage({
      threadId,
      isAssistantMentioned: true,
      text: '@Ada please help',
    });

    expect(mentioned.body.errors).toBeUndefined();
    expect(mentioned.body.data.sendChatMessage.streamId).toEqual(
      expect.any(String),
    );
    expect((await context.readThread(threadId)).isAssistantParticipant).toBe(
      true,
    );
    await waitForAllJobsToFinish();

    const following = await sendChatParticipationMessage({ threadId });

    expect(following.body.errors).toBeUndefined();
    expect(following.body.data.sendChatMessage.streamId).toBeNull();
    expect((await context.readThread(threadId)).isAssistantParticipant).toBe(
      true,
    );
    expect(models.evaluate).not.toHaveBeenCalled();
  });

  it('blocks initial Ada additions and mentions in a canonical DM under Never', async () => {
    models.enableEvaluation();
    await context.setAssistantModes({
      aiChatDirectMessageAssistantMode: AiChatAssistantMode.NEVER,
    });
    const threadId = await createDirectMessage();
    const response = await sendChatParticipationMessage({
      threadId,
      isAssistantParticipant: true,
      isAssistantMentioned: true,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sendChatMessage.streamId).toBeNull();
    expect((await context.readThread(threadId)).isAssistantParticipant).toBe(
      false,
    );
    expect(models.evaluate).not.toHaveBeenCalled();
  });

  it('includes Ada on the first automatic DM message without replying while the client cannot run her', async () => {
    models.enableEvaluation();
    await context.setAssistantModes({
      aiChatDirectMessageAssistantMode: AiChatAssistantMode.AUTOMATIC,
      aiChatInboxAssistantMode: AiChatAssistantMode.NEVER,
    });
    const threadId = await createDirectMessage();
    const response = await sendChatParticipationMessage({
      threadId,
      isAssistantParticipant: false,
      shouldAssistantReply: false,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sendChatMessage.streamId).toBeNull();
    expect((await context.readThread(threadId)).isAssistantParticipant).toBe(
      true,
    );
    expect(models.evaluate).not.toHaveBeenCalled();
  });

  it('stops replies in an existing DM after the workspace changes to Never', async () => {
    models.enableEvaluation();
    await context.setAssistantModes({
      aiChatDirectMessageAssistantMode: AiChatAssistantMode.AUTOMATIC,
    });
    const threadId = await createDirectMessage();
    const first = await sendChatParticipationMessage({ threadId });

    expect(first.body.errors).toBeUndefined();
    expect(first.body.data.sendChatMessage.streamId).toEqual(
      expect.any(String),
    );
    await waitForAllJobsToFinish();
    await context.setAssistantModes({
      aiChatDirectMessageAssistantMode: AiChatAssistantMode.NEVER,
    });
    models.evaluate.mockClear();
    const following = await sendChatParticipationMessage({
      threadId,
      isAssistantMentioned: true,
    });

    expect(following.body.errors).toBeUndefined();
    expect(following.body.data.sendChatMessage.streamId).toBeNull();
    expect((await context.readThread(threadId)).isAssistantParticipant).toBe(
      false,
    );
    expect(models.evaluate).not.toHaveBeenCalled();
  });

  it('answers an Ada-only chat despite both Never settings and client opt-outs', async () => {
    await context.setAssistantModes({
      aiChatDirectMessageAssistantMode: AiChatAssistantMode.NEVER,
      aiChatInboxAssistantMode: AiChatAssistantMode.NEVER,
    });
    const threadId = context.registerThread();
    const response = await sendChatParticipationMessage({
      threadId,
      isAssistantParticipant: false,
      shouldAssistantReply: false,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sendChatMessage.streamId).toEqual(
      expect.any(String),
    );
    expect((await context.readThread(threadId)).isAssistantParticipant).toBe(
      true,
    );
    expect(models.evaluate).not.toHaveBeenCalled();
  });

  it('delivers valid initial recipients unread without marking them mentioned', async () => {
    const threadId = context.registerThread();
    const recipientId = WORKSPACE_MEMBER_DATA_SEED_IDS.JONY;
    const foreignMemberId = randomUUID();
    const response = await sendChatParticipationMessage({
      threadId,
      recipientWorkspaceMemberIds: [
        recipientId,
        recipientId,
        foreignMemberId,
        WORKSPACE_MEMBER_DATA_SEED_IDS.SCOTT,
      ],
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sendChatMessage.streamId).toBeNull();
    expect(
      response.body.data.sendChatMessage.recipientParticipantWorkspaceMemberIds,
    ).toEqual([recipientId]);
    const participants = await context.readParticipants(threadId);

    expect(participants).toContainEqual(
      expect.objectContaining({
        workspaceMemberId: recipientId,
        lastReadAt: null,
        archivedAt: null,
        isSubscribed: true,
        lastMentionedAt: null,
      }),
    );
    expect(participants).not.toContainEqual(
      expect.objectContaining({ workspaceMemberId: foreignMemberId }),
    );
    expect(participants).not.toContainEqual(
      expect.objectContaining({
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.SCOTT,
      }),
    );
  });

  it('does not turn a direct chat into a group for an invalid mentioned member', async () => {
    const threadId = context.registerThread();
    const response = await sendChatParticipationMessage({
      threadId,
      mentionedWorkspaceMemberIds: [randomUUID()],
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sendChatMessage.streamId).toEqual(
      expect.any(String),
    );
    expect(
      response.body.data.sendChatMessage.mentionedParticipantWorkspaceMemberIds,
    ).toEqual([]);
  });

  it('refuses a read-only sender without changing ownership or adding a message', async () => {
    const threadId = await context.createThread(false);

    await context.share({
      threadId,
      recipientWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      accessLevel: RecordShareAccessLevel.READ,
    });
    const response = await sendChatParticipationMessage({
      threadId,
      isAssistantMentioned: true,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(response.body.errors).toBeDefined();
    expect(await context.readThread(threadId)).toMatchObject({
      isAssistantParticipant: false,
      workspaceMemberId: context.workspaceMemberId,
    });
    expect(
      await context.chatService.hasMessages({
        workspaceId: context.workspaceId,
        threadId,
      }),
    ).toBe(false);
  });

  it('excludes read-only recipients when the sender cannot grant them access', async () => {
    const threadId = await context.createThread(false);
    const senderId = WORKSPACE_MEMBER_DATA_SEED_IDS.JONY;
    const recipientId = WORKSPACE_MEMBER_DATA_SEED_IDS.TIM;

    await context.share({
      threadId,
      recipientWorkspaceMemberId: senderId,
      accessLevel: RecordShareAccessLevel.READ_WRITE,
    });
    await context.share({
      threadId,
      recipientWorkspaceMemberId: recipientId,
      accessLevel: RecordShareAccessLevel.READ,
    });

    expect(
      await context.sharingService.findEligibleParticipantWorkspaceMemberIds({
        workspaceId: context.workspaceId,
        workspaceMemberId: senderId,
        threadId,
        memberIds: [recipientId, randomUUID()],
      }),
    ).toEqual([]);

    const response = await sendChatParticipationMessage({
      threadId,
      isAssistantParticipant: false,
      recipientWorkspaceMemberIds: [recipientId],
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(response.body.errors).toBeUndefined();
    expect(
      response.body.data.sendChatMessage.recipientParticipantWorkspaceMemberIds,
    ).toEqual([]);
    expect(await context.readParticipants(threadId)).not.toContainEqual(
      expect.objectContaining({ workspaceMemberId: recipientId }),
    );
  });

  it('allows revised initial choices after a failed send leaves an empty thread', async () => {
    const threadId = context.registerThread();
    const failed = await sendChatParticipationMessage({
      threadId,
      modelId: 'missing-provider/missing-model',
      isAssistantParticipant: true,
    });

    expect(failed.body.errors).toBeDefined();
    expect(
      await context.chatService.hasMessages({
        workspaceId: context.workspaceId,
        threadId,
      }),
    ).toBe(false);

    const retried = await sendChatParticipationMessage({
      threadId,
      isAssistantParticipant: false,
      recipientWorkspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
    });

    expect(retried.body.errors).toBeUndefined();
    expect(retried.body.data.sendChatMessage.streamId).toBeNull();
    expect((await context.readThread(threadId)).isAssistantParticipant).toBe(
      false,
    );
  });

  it('keeps Ada excluded for a cached client that omits the mention signal', async () => {
    const threadId = await context.createThread(false);

    await addJonyAsParticipant(threadId);
    await context.saveMessage({ threadId });
    const response = await sendChatParticipationMessage({
      threadId,
      isAssistantMentioned: null,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sendChatMessage.streamId).toBeNull();
    expect((await context.readThread(threadId)).isAssistantParticipant).toBe(
      false,
    );
  });

  it('does not bypass mention-only mode when a cached client omits the mention signal', async () => {
    models.enableEvaluation();
    await context.setAssistantModes({
      aiChatInboxAssistantMode: AiChatAssistantMode.MENTION_ONLY,
    });
    const threadId = await context.createThread();

    await addJonyAsParticipant(threadId);
    const response = await sendChatParticipationMessage({
      threadId,
      isAssistantMentioned: null,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sendChatMessage.streamId).toBeNull();
    expect(models.evaluate).not.toHaveBeenCalled();
  });

  it('preserves assistant execution outside the inbox when the client disables replies', async () => {
    await context.featureFlagService.upsertWorkspaceFeatureFlag({
      workspaceId: context.workspaceId,
      featureFlag: FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
      value: false,
    });
    const threadId = context.registerThread();
    const response = await sendChatParticipationMessage({
      threadId,
      shouldAssistantReply: false,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sendChatMessage.streamId).toEqual(
      expect.any(String),
    );
  });
});
