import { type AgentChatDirectMessageIdentityService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-direct-message-identity.service';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { AgentChatInboxDeliveryReason } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-inbox-delivery-reason.enum';
import { configureChatParticipationModels } from 'test/integration/ai/utils/configure-chat-participation-models.util';
import { createChatParticipationTestContext } from 'test/integration/ai/utils/create-chat-participation-test-context.util';
import { writeChatMemberMessage } from 'test/integration/ai/utils/write-chat-member-message.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { FeatureFlagKey } from 'twenty-shared/types';

import { AiChatAssistantMode } from 'src/engine/core-modules/workspace/enums/ai-chat-assistant-mode.enum';
import { type AgentChatAssistantReplyContext } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-assistant-reply-context.type';
import { AgentChatReplyDecision } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-reply-decision.enum';
import { AgentChatMemberMessagePlacement } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-member-message-placement.enum';
import { buildAskQuestionPendingOutput } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/ask-question.pausing-tool';
import { type AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentMessageStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-status.enum';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

describe('Assistant reply selection with stored conversation participants', () => {
  let context: Awaited<ReturnType<typeof createChatParticipationTestContext>>;
  let models: ReturnType<typeof configureChatParticipationModels>;

  beforeEach(async () => {
    context = await createChatParticipationTestContext();
    models = configureChatParticipationModels();
  });

  afterEach(async () => {
    await context.cleanup();
    models.restore();
  });

  const shouldReply = async ({
    threadId,
    isAssistantMentioned = false,
    shouldAssistantReply = true,
    isAiChatInboxEnabled = true,
    text = 'Can Ada help with the latest task?',
  }: {
    threadId: string;
    isAssistantMentioned?: boolean | null;
    shouldAssistantReply?: boolean;
    isAiChatInboxEnabled?: boolean;
    text?: string;
  }) => {
    const isAssistantMentionedInMessage = isAssistantMentioned ?? false;
    const thread = await context.threadService.getWritableThread({
      threadId,
      workspaceId: context.workspaceId,
      workspaceMemberId: context.workspaceMemberId,
    });
    const participation =
      await context.assistantParticipationService.resolveAssistantParticipation(
        {
          thread,
          workspaceId: context.workspaceId,
          workspaceMemberId: context.workspaceMemberId,
          isAssistantMentioned: isAssistantMentionedInMessage,
          isReplyRequested: shouldAssistantReply,
        },
      );

    await context.assistantParticipationService.persistAssistantParticipation({
      thread,
      workspaceId: context.workspaceId,
      participation,
    });

    const decision = isAiChatInboxEnabled
      ? participation.replyDecision
      : AgentChatReplyDecision.REPLY;

    return context.replyPolicyService.shouldReply({
      decision,
      threadId,
      pendingQuestionMessageId: thread.pendingQuestionMessageId,
      workspaceId: context.workspaceId,
      userWorkspaceId: context.userWorkspaceId,
      text,
    });
  };
  const addJonyAsParticipant = (threadId: string) =>
    context.inboxDeliveryService.deliverThreadToMemberInboxes({
      workspaceId: context.workspaceId,
      workspaceMemberId: context.workspaceMemberId,
      threadId,
      workspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
      reason: AgentChatInboxDeliveryReason.RECIPIENT,
    });
  const createGroup = async (isAssistantParticipant = true) => {
    const threadId = await context.createThread(isAssistantParticipant);

    await addJonyAsParticipant(threadId);

    return threadId;
  };
  const createDirectMessage = async () =>
    context.registerThread(
      await getAppProviderByClassName<AgentChatDirectMessageIdentityService>(
        'AgentChatDirectMessageIdentityService',
      ).open({
        workspaceId: context.workspaceId,
        firstWorkspaceMemberId: context.workspaceMemberId,
        secondWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      }),
    );
  const saveMessageWithReplyContext = async ({
    threadId,
    assistantReplyContext,
  }: {
    threadId: string;
    assistantReplyContext: AgentChatAssistantReplyContext;
  }) => {
    const savedMessage = await writeChatMemberMessage({
      actor: {
        workspaceId: context.workspaceId,
        workspaceMemberId: context.workspaceMemberId,
        userWorkspaceId: context.userWorkspaceId,
      },
      thread: await context.threadService.getWritableThread({
        threadId,
        workspaceId: context.workspaceId,
        workspaceMemberId: context.workspaceMemberId,
      }),
      message: { text: 'Continue the task with this answer.' },
      placement: AgentChatMemberMessagePlacement.COMPLETED,
      assistantReplyContext,
    });

    return { messageId: savedMessage.id };
  };
  const shouldExecute = ({
    threadId,
    messageId,
  }: {
    threadId: string;
    messageId: string;
  }) =>
    context.replyExecutionPolicyService.shouldExecute({
      threadId,
      messageId,
      workspaceId: context.workspaceId,
      userWorkspaceId: context.userWorkspaceId,
    });

  it('stops DM admission and queued replies when the Inbox rollout is disabled', async () => {
    models.enableEvaluation();
    const threadId = await createDirectMessage();

    await context.setAssistantModes({
      aiChatDirectMessageAssistantMode: AiChatAssistantMode.AUTOMATIC,
    });
    await expect(
      shouldReply({ threadId, isAssistantMentioned: true }),
    ).resolves.toBe(true);

    const { messageId } = await saveMessageWithReplyContext({
      threadId,
      assistantReplyContext: {
        isAssistantMentioned: true,
        isDirectAssistantChat: false,
        isStructuredRequestContinuation: false,
      },
    });

    await expect(shouldExecute({ threadId, messageId })).resolves.toBe(true);
    await context.featureFlagService.upsertWorkspaceFeatureFlag({
      workspaceId: context.workspaceId,
      featureFlag: FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
      value: false,
    });
    await expect(shouldExecute({ threadId, messageId })).resolves.toBe(false);
    await expect(
      shouldReply({ threadId, isAssistantMentioned: true }),
    ).resolves.toBe(false);
    expect(models.evaluate).not.toHaveBeenCalled();
  });

  it('does not invoke the evaluator while Ada is absent', async () => {
    models.enableEvaluation();
    const threadId = await createGroup(false);

    await expect(shouldReply({ threadId })).resolves.toBe(false);
    expect(models.evaluate).not.toHaveBeenCalled();
  });

  it('keeps replying in a shared chat while the inbox is not enabled', async () => {
    models.enableEvaluation();
    const threadId = await createGroup(false);

    await context.setAssistantModes({
      aiChatInboxAssistantMode: AiChatAssistantMode.NEVER,
    });

    await expect(
      shouldReply({
        threadId,
        shouldAssistantReply: false,
        isAiChatInboxEnabled: false,
      }),
    ).resolves.toBe(true);
    expect(models.evaluate).not.toHaveBeenCalled();
  });

  it('answers an Ada-only chat despite workspace Never modes and client opt-outs', async () => {
    models.enableEvaluation();
    await context.setAssistantModes({
      aiChatDirectMessageAssistantMode: AiChatAssistantMode.NEVER,
      aiChatInboxAssistantMode: AiChatAssistantMode.NEVER,
    });
    const threadId = await context.createThread(false);

    await expect(
      shouldReply({ threadId, shouldAssistantReply: false }),
    ).resolves.toBe(true);
    expect(models.evaluate).not.toHaveBeenCalled();
  });

  it('stays silent on a mention or an automatic DM while the client cannot run Ada', async () => {
    models.enableEvaluation();
    await context.setAssistantModes({
      aiChatDirectMessageAssistantMode: AiChatAssistantMode.AUTOMATIC,
    });
    const groupThreadId = await createGroup();
    const directMessageThreadId = await createDirectMessage();

    await expect(
      shouldReply({
        threadId: groupThreadId,
        isAssistantMentioned: true,
        shouldAssistantReply: false,
      }),
    ).resolves.toBe(false);
    await expect(
      shouldReply({
        threadId: directMessageThreadId,
        shouldAssistantReply: false,
      }),
    ).resolves.toBe(false);
    expect(models.evaluate).not.toHaveBeenCalled();
  });

  it('blocks an explicit mention in a shared chat when the inbox mode is Never', async () => {
    models.enableEvaluation();
    const threadId = await createGroup();

    await context.setAssistantModes({
      aiChatInboxAssistantMode: AiChatAssistantMode.NEVER,
    });

    await expect(
      shouldReply({ threadId, isAssistantMentioned: true }),
    ).resolves.toBe(false);
    expect(models.evaluate).not.toHaveBeenCalled();
  });

  it.each([false, null])(
    'keeps a shared chat mention-only with available JEV and mention signal %s',
    async (isAssistantMentioned) => {
      models.enableEvaluation();
      const threadId = await createGroup();

      await context.setAssistantModes({
        aiChatInboxAssistantMode: AiChatAssistantMode.MENTION_ONLY,
      });

      await expect(
        shouldReply({ threadId, isAssistantMentioned }),
      ).resolves.toBe(false);
      await expect(
        shouldReply({ threadId, isAssistantMentioned: true }),
      ).resolves.toBe(true);
      expect(models.evaluate).not.toHaveBeenCalled();
    },
  );

  it('uses the DM mention mode independently of Inbox mode and participant count', async () => {
    models.enableEvaluation();
    const threadId = await createDirectMessage();

    await addJonyAsParticipant(threadId);
    await context.setAssistantModes({
      aiChatDirectMessageAssistantMode: AiChatAssistantMode.MENTION_ONLY,
      aiChatInboxAssistantMode: AiChatAssistantMode.NEVER,
    });

    expect(await context.readParticipants(threadId)).toHaveLength(1);
    await expect(shouldReply({ threadId })).resolves.toBe(false);
    await expect(
      shouldReply({ threadId, isAssistantMentioned: true }),
    ).resolves.toBe(true);
    expect(models.evaluate).not.toHaveBeenCalled();
  });

  it('applies the inbox mode to a channel with only one participant', async () => {
    const threadId = await context.createChannelThread();

    await context.setAssistantModes({
      aiChatInboxAssistantMode: AiChatAssistantMode.NEVER,
    });

    expect(await context.readParticipants(threadId)).toHaveLength(1);
    await expect(
      shouldReply({ threadId, isAssistantMentioned: true }),
    ).resolves.toBe(false);
    expect(models.evaluate).not.toHaveBeenCalled();
  });

  it.each([false, true])(
    'uses the group mention default without JEV when mentioned is %s',
    async (isAssistantMentioned) => {
      const threadId = await createGroup();

      await expect(
        shouldReply({ threadId, isAssistantMentioned }),
      ).resolves.toBe(isAssistantMentioned);
      expect(models.evaluate).not.toHaveBeenCalled();
    },
  );

  it.each([
    { probability: 0.49, shouldAnswer: false },
    { probability: 0.5, shouldAnswer: true },
  ])(
    'uses JEV probability $probability for a group message',
    async ({ probability, shouldAnswer }) => {
      models.enableEvaluation();
      models.setReplyProbability(probability);
      const threadId = await createGroup();

      await expect(shouldReply({ threadId })).resolves.toBe(shouldAnswer);
      expect(models.evaluate).toHaveBeenCalledTimes(1);
    },
  );

  it('passes the configured name to the reply evaluator', async () => {
    models.enableEvaluation();
    const coreEntityCacheService =
      getAppProviderByClassName<CoreEntityCacheService>(
        'CoreEntityCacheService',
      );
    const workspaceRepository =
      getCoreRepository<WorkspaceEntity>(WorkspaceEntity);
    const workspace = await workspaceRepository.findOneByOrFail({
      id: context.workspaceId,
    });
    const threadId = await createGroup();

    try {
      await workspaceRepository.update(context.workspaceId, {
        aiChatAssistantProfile: {
          ...workspace.aiChatAssistantProfile,
          displayName: 'Scout "CRM"',
        },
      });
      await coreEntityCacheService.invalidate(
        'workspaceEntity',
        context.workspaceId,
      );
      await shouldReply({ threadId, text: 'Scout, can you help?' });
      expect(models.evaluate).toHaveBeenCalledTimes(1);
      expect(models.evaluate).toHaveBeenCalledWith(
        expect.objectContaining({
          state: expect.objectContaining({
            assistant: { displayName: 'Scout "CRM"' },
          }),
        }),
      );
    } finally {
      await workspaceRepository.update(context.workspaceId, {
        aiChatAssistantProfile: workspace.aiChatAssistantProfile,
      });
      await coreEntityCacheService.invalidate(
        'workspaceEntity',
        context.workspaceId,
      );
    }
  });

  it('answers an explicit mention without evaluating it', async () => {
    models.enableEvaluation();
    const threadId = await createGroup(false);

    await expect(
      shouldReply({
        threadId,
        isAssistantMentioned: true,
      }),
    ).resolves.toBe(true);
    expect(models.evaluate).not.toHaveBeenCalled();
  });

  it('stays silent on an unmentioned group message after an evaluation failure', async () => {
    models.enableEvaluation();
    models.evaluate.mockRejectedValue(new Error('Evaluation transport failed'));
    const threadId = await createGroup();

    await expect(shouldReply({ threadId })).resolves.toBe(false);
  });

  it('continues a pending question without relying on the evaluator', async () => {
    const threadId = await createGroup();
    const { turnId } = await context.chatService.addMessage({
      threadId,
      workspaceId: context.workspaceId,
      userWorkspaceId: context.userWorkspaceId,
      uiMessage: {
        role: AgentMessageRole.USER,
        parts: [{ type: 'text', text: 'Draft a quote.' }],
      },
    });
    const conversationWriterService =
      getAppProviderByClassName<AgentConversationWriterService>(
        'AgentConversationWriterService',
      );
    const question = {
      header: 'Plan',
      question: 'Which plan should I quote?',
      options: [{ label: 'Pro' }, { label: 'Team' }],
    };

    await conversationWriterService.insertMessage({
      workspaceId: context.workspaceId,
      threadId,
      turnId,
      role: AgentMessageRole.ASSISTANT,
      agentId: null,
      senderUserWorkspaceId: null,
      isAwaitingAnswer: true,
      parts: [
        {
          type: 'dynamic-tool',
          toolName: 'ask_question',
          toolCallId: 'pending-quote-plan',
          state: 'output-available',
          input: question,
          output: buildAskQuestionPendingOutput(question),
        },
      ],
    });

    await expect(shouldReply({ threadId, text: 'Pro' })).resolves.toBe(true);

    models.enableEvaluation();
    models.setReplyProbability(0);

    await expect(shouldReply({ threadId, text: 'Pro' })).resolves.toBe(true);
    expect(models.evaluate).not.toHaveBeenCalled();
  });

  it('rechecks persisted participants when a direct chat becomes a group', async () => {
    const threadId = await context.createThread();

    await expect(shouldReply({ threadId })).resolves.toBe(true);
    await addJonyAsParticipant(threadId);
    await expect(shouldReply({ threadId })).resolves.toBe(false);
  });

  it('blocks queued execution after Never is enabled and retains the accepted message', async () => {
    const threadId = await createGroup();
    const { messageId } = await saveMessageWithReplyContext({
      threadId,
      assistantReplyContext: {
        isAssistantMentioned: true,
        isDirectAssistantChat: false,
        isStructuredRequestContinuation: false,
      },
    });

    await expect(shouldExecute({ threadId, messageId })).resolves.toBe(true);
    await context.setAssistantModes({
      aiChatInboxAssistantMode: AiChatAssistantMode.NEVER,
    });

    await expect(shouldExecute({ threadId, messageId })).resolves.toBe(false);
    expect(
      await context.chatService.getMessagesForThread({
        workspaceId: context.workspaceId,
        workspaceMemberId: context.workspaceMemberId,
        threadId,
      }),
    ).toContainEqual(expect.objectContaining({ id: messageId }));
  });

  it('blocks a previously automatic unmentioned message after switching to mention-only', async () => {
    const threadId = await createGroup();
    const { messageId } = await saveMessageWithReplyContext({
      threadId,
      assistantReplyContext: {
        isAssistantMentioned: false,
        isDirectAssistantChat: false,
        isStructuredRequestContinuation: false,
      },
    });

    await expect(shouldExecute({ threadId, messageId })).resolves.toBe(true);
    await context.setAssistantModes({
      aiChatInboxAssistantMode: AiChatAssistantMode.MENTION_ONLY,
    });

    await expect(shouldExecute({ threadId, messageId })).resolves.toBe(false);
  });

  it('executes a persisted explicit mention under mention-only mode', async () => {
    models.enableEvaluation();
    const threadId = await createGroup();
    const { messageId } = await saveMessageWithReplyContext({
      threadId,
      assistantReplyContext: {
        isAssistantMentioned: true,
        isDirectAssistantChat: false,
        isStructuredRequestContinuation: false,
      },
    });

    await context.setAssistantModes({
      aiChatInboxAssistantMode: AiChatAssistantMode.MENTION_ONLY,
    });

    await expect(shouldExecute({ threadId, messageId })).resolves.toBe(true);
    expect(models.evaluate).not.toHaveBeenCalled();
  });

  it('executes a persisted structured answer under mention-only mode', async () => {
    models.enableEvaluation();
    const threadId = await createGroup();
    const { messageId } = await saveMessageWithReplyContext({
      threadId,
      assistantReplyContext: {
        isAssistantMentioned: false,
        isDirectAssistantChat: false,
        isStructuredRequestContinuation: true,
      },
    });

    await context.setAssistantModes({
      aiChatInboxAssistantMode: AiChatAssistantMode.MENTION_ONLY,
    });

    await expect(shouldExecute({ threadId, messageId })).resolves.toBe(true);
    expect(models.evaluate).not.toHaveBeenCalled();
  });

  it('executes a message saved before reply contexts unless the mode is Never', async () => {
    const threadId = await createGroup();
    const { id: messageId } = await context.saveMessage({ threadId });

    await context.setAssistantModes({
      aiChatInboxAssistantMode: AiChatAssistantMode.MENTION_ONLY,
    });
    await expect(shouldExecute({ threadId, messageId })).resolves.toBe(true);
    await context.setAssistantModes({
      aiChatInboxAssistantMode: AiChatAssistantMode.NEVER,
    });
    await expect(shouldExecute({ threadId, messageId })).resolves.toBe(false);
  });

  it('executes a saved turn while the inbox is not enabled', async () => {
    const threadId = await createGroup(false);
    const { messageId } = await saveMessageWithReplyContext({
      threadId,
      assistantReplyContext: {
        isAssistantMentioned: false,
        isDirectAssistantChat: false,
        isStructuredRequestContinuation: false,
      },
    });

    await context.setAssistantModes({
      aiChatInboxAssistantMode: AiChatAssistantMode.NEVER,
    });
    await context.featureFlagService.upsertWorkspaceFeatureFlag({
      workspaceId: context.workspaceId,
      featureFlag: FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
      value: false,
    });

    await expect(shouldExecute({ threadId, messageId })).resolves.toBe(true);
  });

  it('does not exempt a canonical DM with one remaining human at execution time', async () => {
    const threadId = await createDirectMessage();

    await context.setStoredAssistantParticipation({
      threadId,
      isAssistantParticipant: true,
    });
    const { messageId } = await saveMessageWithReplyContext({
      threadId,
      assistantReplyContext: {
        isAssistantMentioned: true,
        isDirectAssistantChat: false,
        isStructuredRequestContinuation: false,
      },
    });

    await expect(shouldExecute({ threadId, messageId })).resolves.toBe(true);

    await context.setAssistantModes({
      aiChatDirectMessageAssistantMode: AiChatAssistantMode.NEVER,
    });

    expect(await context.readParticipants(threadId)).toHaveLength(1);
    await expect(shouldExecute({ threadId, messageId })).resolves.toBe(false);
  });

  it('executes an Ada-only message under both Never settings', async () => {
    const threadId = await context.createThread(false);
    const { messageId } = await saveMessageWithReplyContext({
      threadId,
      assistantReplyContext: {
        isAssistantMentioned: false,
        isDirectAssistantChat: true,
        isStructuredRequestContinuation: false,
      },
    });

    await context.setAssistantModes({
      aiChatDirectMessageAssistantMode: AiChatAssistantMode.NEVER,
      aiChatInboxAssistantMode: AiChatAssistantMode.NEVER,
    });

    await expect(shouldExecute({ threadId, messageId })).resolves.toBe(true);
    expect(models.evaluate).not.toHaveBeenCalled();
  });

  it('executes a structured answer in an Ada-only chat under both Never settings', async () => {
    const threadId = await context.createThread();
    const { messageId } = await saveMessageWithReplyContext({
      threadId,
      assistantReplyContext: {
        isAssistantMentioned: false,
        isDirectAssistantChat: false,
        isStructuredRequestContinuation: true,
      },
    });

    await context.setAssistantModes({
      aiChatDirectMessageAssistantMode: AiChatAssistantMode.NEVER,
      aiChatInboxAssistantMode: AiChatAssistantMode.NEVER,
    });

    await expect(shouldExecute({ threadId, messageId })).resolves.toBe(true);
    expect(models.evaluate).not.toHaveBeenCalled();
  });

  it('preserves the shared audience of a first send before recipient delivery completes', async () => {
    const threadId = await context.createThread();
    const { messageId } = await saveMessageWithReplyContext({
      threadId,
      assistantReplyContext: {
        isAssistantMentioned: true,
        isDirectAssistantChat: false,
        isStructuredRequestContinuation: false,
      },
    });

    await context.setAssistantModes({
      aiChatInboxAssistantMode: AiChatAssistantMode.NEVER,
    });

    expect(await context.readParticipants(threadId)).toHaveLength(1);
    await expect(shouldExecute({ threadId, messageId })).resolves.toBe(false);
  });

  it('passes only the recent sent conversation texts to the external evaluator', async () => {
    models.enableEvaluation();
    const threadId = await createGroup();

    await context.chatService.replaceOpeningTurn({
      workspaceId: context.workspaceId,
      threadId,
      context: 'Private system context',
    });
    const texts = Array.from({ length: 22 }, (_, index) => `Message ${index}`);
    const messageIds: string[] = [];

    for (const text of texts) {
      const message = await context.chatService.addMessage({
        threadId,
        workspaceId: context.workspaceId,
        userWorkspaceId: context.userWorkspaceId,
        turnStatus: AgentTurnStatus.COMPLETED,
        uiMessage: {
          role: AgentMessageRole.USER,
          parts: [
            { type: 'text', text },
            { type: 'text', text: ' \t\n' },
          ],
        },
      });

      messageIds.push(message.id);
    }

    await global.testDataSource.query(
      `UPDATE "${context.schema}"."agentMessage" message
       SET "processedAt" = $2::timestamptz + source.ordinality * interval '1 second',
           "createdAt" = $2::timestamptz + source.ordinality * interval '1 second'
       FROM unnest($1::uuid[]) WITH ORDINALITY AS source(id, ordinality)
       WHERE message.id = source.id`,
      [messageIds, '2026-01-01T00:00:00.000Z'],
    );

    await context.chatService.addMessage({
      threadId,
      workspaceId: context.workspaceId,
      userWorkspaceId: context.userWorkspaceId,
      turnStatus: AgentTurnStatus.FAILED,
      uiMessage: {
        role: AgentMessageRole.USER,
        parts: [{ type: 'text', text: 'Failed turn' }],
      },
    });
    const queuedMessage = await context.chatService.addMessage({
      threadId,
      workspaceId: context.workspaceId,
      userWorkspaceId: context.userWorkspaceId,
      turnStatus: AgentTurnStatus.COMPLETED,
      uiMessage: {
        role: AgentMessageRole.USER,
        parts: [{ type: 'text', text: 'Queued message' }],
      },
    });
    await global.testDataSource.query(
      `UPDATE "${context.schema}"."agentMessage"
       SET status = $2, "processedAt" = NULL WHERE id = $1`,
      [queuedMessage.id, AgentMessageStatus.QUEUED],
    );
    await shouldReply({ threadId });

    expect(models.evaluate).toHaveBeenCalledWith(
      expect.objectContaining({
        state: {
          assistant: { displayName: expect.any(String) },
          conversation: texts
            .slice(-20)
            .map((text) => ({ role: 'user', text })),
          message: {
            text: 'Can Ada help with the latest task?',
            isAssistantMentioned: false,
          },
        },
      }),
    );
  });

  it('passes all visible assistant text in order without tool calls or empty messages', async () => {
    models.enableEvaluation();
    const threadId = await createGroup();
    const toolPart = {
      type: 'dynamic-tool' as const,
      toolName: 'search',
      toolCallId: 'visible-message-tool',
      state: 'output-available' as const,
      input: { query: 'Private tool input' },
      output: { result: 'Private tool output' },
    };

    await context.chatService.addMessage({
      threadId,
      workspaceId: context.workspaceId,
      userWorkspaceId: context.userWorkspaceId,
      turnStatus: AgentTurnStatus.COMPLETED,
      uiMessage: {
        role: AgentMessageRole.ASSISTANT,
        parts: [
          { type: 'text', text: 'I will check the latest status.' },
          toolPart,
          { type: 'text', text: 'The task is complete.' },
          { type: 'text', text: ' \t\n' },
        ],
      },
    });
    await context.chatService.addMessage({
      threadId,
      workspaceId: context.workspaceId,
      userWorkspaceId: context.userWorkspaceId,
      turnStatus: AgentTurnStatus.COMPLETED,
      uiMessage: {
        role: AgentMessageRole.ASSISTANT,
        parts: [
          { ...toolPart, toolCallId: 'tool-only-message' },
          { type: 'text', text: ' \t\n' },
        ],
      },
    });

    await shouldReply({ threadId });

    expect(models.evaluate).toHaveBeenCalledWith(
      expect.objectContaining({
        state: {
          assistant: { displayName: expect.any(String) },
          conversation: [
            {
              role: 'assistant',
              text: 'I will check the latest status.\n\nThe task is complete.',
            },
          ],
          message: {
            text: 'Can Ada help with the latest task?',
            isAssistantMentioned: false,
          },
        },
      }),
    );
  });
});
