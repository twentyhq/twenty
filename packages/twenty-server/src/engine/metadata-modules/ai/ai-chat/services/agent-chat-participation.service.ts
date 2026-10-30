import { Injectable, Logger } from '@nestjs/common';

import { doNotTranslate } from 'twenty-shared/i18n';
import { FeatureFlagKey } from 'twenty-shared/types';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';

import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { type AgentChatThreadAccessArgs } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-access-args.type';
import { formatErrorWithCause } from 'src/engine/metadata-modules/ai/ai-chat/utils/format-error-with-cause.util';

const AGENT_CHAT_MESSAGE_LOCK_KEY_PREFIX = 'agent-chat-message:';
const AGENT_CHAT_MESSAGE_LOCK_WAIT_MS = 30_000;
const AGENT_CHAT_MESSAGE_LOCK_RETRY_INTERVAL_MS = 100;

type AgentChatMessageParticipationArgs = AgentChatThreadAccessArgs & {
  messageId: string;
  isAssistantMentioned: boolean;
  recipientWorkspaceMemberIds: string[];
  mentionedWorkspaceMemberIds?: string[];
};

@Injectable()
export class AgentChatParticipationService {
  private readonly logger = new Logger(AgentChatParticipationService.name);

  constructor(
    private readonly chatService: AgentChatService,
    private readonly threadService: AgentChatThreadService,
    private readonly cacheLockService: CacheLockService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  runWithMessageLock<TResult>({
    workspaceId,
    threadId,
    work,
  }: {
    workspaceId: string;
    threadId: string;
    work: () => Promise<TResult>;
  }): Promise<TResult> {
    return this.cacheLockService.withLock(
      work,
      `${AGENT_CHAT_MESSAGE_LOCK_KEY_PREFIX}${workspaceId}:${threadId}`,
      {
        ms: AGENT_CHAT_MESSAGE_LOCK_RETRY_INTERVAL_MS,
        maxRetries: Math.ceil(
          AGENT_CHAT_MESSAGE_LOCK_WAIT_MS /
            AGENT_CHAT_MESSAGE_LOCK_RETRY_INTERVAL_MS,
        ),
      },
    );
  }

  async sendMessageWithParticipation<TSentMessage extends object>({
    sendMessage,
    ...participationArgs
  }: AgentChatMessageParticipationArgs & {
    sendMessage: (isAiChatInboxEnabled: boolean) => Promise<TSentMessage>;
  }): Promise<
    TSentMessage & { recipientParticipantWorkspaceMemberIds: string[] }
  > {
    const isAiChatInboxEnabled = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
      participationArgs.workspaceId,
    );

    if (!isAiChatInboxEnabled) {
      const sentMessage = await sendMessage(false);

      return { ...sentMessage, recipientParticipantWorkspaceMemberIds: [] };
    }

    return this.runWithMessageLock({
      workspaceId: participationArgs.workspaceId,
      threadId: participationArgs.threadId,
      work: async () => {
        const sentMessage = await sendMessage(true).catch(
          async (error: unknown) => {
            await this.completeMessage(participationArgs);

            throw error;
          },
        );

        const recipientParticipantWorkspaceMemberIds =
          await this.completeMessage({
            ...participationArgs,
            isAssistantParticipationApplied: true,
          });

        return { ...sentMessage, recipientParticipantWorkspaceMemberIds };
      },
    });
  }

  // The message may already be saved, so a participation failure must not fail the send
  async completeMessage(
    args: AgentChatMessageParticipationArgs & {
      isAssistantParticipationApplied?: boolean;
    },
  ): Promise<string[]> {
    try {
      return await this.applyMessageParticipation(args);
    } catch (error) {
      this.logger.warn(
        doNotTranslate(
          `Could not apply participation for chat message ${args.messageId} in thread ${args.threadId} of workspace ${args.workspaceId}: ${formatErrorWithCause(error)}`,
        ),
      );

      return [];
    }
  }

  private async applyMessageParticipation({
    messageId,
    isAssistantMentioned,
    recipientWorkspaceMemberIds,
    mentionedWorkspaceMemberIds,
    isAssistantParticipationApplied = false,
    ...args
  }: AgentChatMessageParticipationArgs & {
    isAssistantParticipationApplied?: boolean;
  }): Promise<string[]> {
    const isMessageSaved = await this.chatService.hasMessage({
      workspaceId: args.workspaceId,
      threadId: args.threadId,
      messageId,
      workspaceMemberId: args.workspaceMemberId,
    });

    if (!isMessageSaved) {
      return [];
    }

    const isInitialMessage = await this.threadService.isInitialMessage({
      ...args,
      messageId,
    });

    if (isAssistantMentioned && !isAssistantParticipationApplied) {
      await this.threadService.addAssistantParticipant({
        ...args,
        messageId,
        recipientWorkspaceMemberIds,
        mentionedWorkspaceMemberIds,
      });
    }

    if (!isInitialMessage) {
      return [];
    }

    return this.threadService.deliverToParticipants({
      ...args,
      participantWorkspaceMemberIds: recipientWorkspaceMemberIds,
    });
  }
}
