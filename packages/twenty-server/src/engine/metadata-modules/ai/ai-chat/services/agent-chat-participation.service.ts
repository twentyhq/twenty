import { Injectable, Logger } from '@nestjs/common';

import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { AgentChatThreadParticipantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { type AgentChatAssistantParticipation } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-assistant-participation.type';
import { type AgentChatMessageParticipation } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-message-participation.type';
import { type AgentChatMessageParticipationResult } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-message-participation-result.type';
import { type AgentChatThreadAccessArgs } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-access-args.type';
import { formatErrorWithCause } from 'src/engine/metadata-modules/ai/ai-chat/utils/format-error-with-cause.util';
import { AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { type AgentHistoryTransactionScope } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-transaction-scope.type';

type AgentChatParticipantDelivery = AgentChatThreadAccessArgs & {
  participantWorkspaceMemberIds: string[];
};

@Injectable()
export class AgentChatParticipationService {
  private readonly logger = new Logger(AgentChatParticipationService.name);

  constructor(
    private readonly threadService: AgentChatThreadService,
    private readonly participantService: AgentChatThreadParticipantService,
    private readonly conversationWriterService: AgentConversationWriterService,
  ) {}

  async persistMessage<TSavedMessage extends { id: string }>({
    participation,
    persistMessage,
    ...args
  }: AgentChatThreadAccessArgs & {
    participation?: AgentChatMessageParticipation;
    persistMessage: (
      scope: AgentHistoryTransactionScope,
    ) => Promise<TSavedMessage>;
  }): Promise<TSavedMessage & AgentChatMessageParticipationResult> {
    if (!isDefined(participation)) {
      const savedMessage = await this.saveMessage({ ...args, persistMessage });

      return {
        ...savedMessage,
        mentionedParticipantWorkspaceMemberIds: [],
        recipientParticipantWorkspaceMemberIds: [],
      };
    }

    const { assistantParticipation } = participation;
    const savedMessage = await this.saveMessage({
      ...args,
      persistMessage,
      assistantParticipation,
    });
    const mentionedParticipantWorkspaceMemberIds = await this.tryDeliverToInbox(
      {
        ...args,
        messageId: savedMessage.id,
        participantWorkspaceMemberIds:
          participation.mentionedWorkspaceMemberIds,
        deliver: (delivery) => this.threadService.mentionParticipants(delivery),
      },
    );
    const recipientParticipantWorkspaceMemberIds =
      assistantParticipation.isInitialMessage
        ? await this.tryDeliverToInbox({
            ...args,
            messageId: savedMessage.id,
            participantWorkspaceMemberIds:
              participation.recipientWorkspaceMemberIds,
            deliver: (delivery) =>
              this.threadService.deliverToParticipants(delivery),
          })
        : [];

    return {
      ...savedMessage,
      mentionedParticipantWorkspaceMemberIds,
      recipientParticipantWorkspaceMemberIds,
    };
  }

  private saveMessage<TSavedMessage>({
    assistantParticipation,
    persistMessage,
    ...args
  }: AgentChatThreadAccessArgs & {
    assistantParticipation?: AgentChatAssistantParticipation;
    persistMessage: (
      scope: AgentHistoryTransactionScope,
    ) => Promise<TSavedMessage>;
  }): Promise<TSavedMessage> {
    return this.conversationWriterService.runInTransaction(
      args.workspaceId,
      async (scope) => {
        await this.participantService.resolveMentionInTransaction({
          ...args,
          scope,
        });

        if (isDefined(assistantParticipation)) {
          await this.threadService.saveAssistantParticipation({
            workspaceId: args.workspaceId,
            participation: assistantParticipation,
            scope,
          });
        }

        return persistMessage(scope);
      },
    );
  }

  private async tryDeliverToInbox({
    messageId,
    deliver,
    ...delivery
  }: AgentChatParticipantDelivery & {
    messageId: string;
    deliver: (delivery: AgentChatParticipantDelivery) => Promise<string[]>;
  }): Promise<string[]> {
    if (!isNonEmptyArray(delivery.participantWorkspaceMemberIds)) {
      return [];
    }

    try {
      return await deliver(delivery);
    } catch (error) {
      this.logger.warn(
        doNotTranslate(
          `Could not apply participation for chat message ${messageId} in thread ${delivery.threadId} of workspace ${delivery.workspaceId}: ${formatErrorWithCause(error)}`,
        ),
      );

      return [];
    }
  }
}
