import { AgentChatMemberMessagePlacement } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-member-message-placement.enum';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AgentChatThreadConversationType } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { AgentChatAssistantParticipationService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-assistant-participation.service';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatInboxDeliveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-inbox-delivery.service';
import { AgentChatThreadParticipantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { type AgentChatAssistantParticipation } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-assistant-participation.type';
import { type AgentChatAssistantReplyContext } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-assistant-reply-context.type';
import { type AgentChatInboxDeliveryResult } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-inbox-delivery-result.type';
import { type AgentChatMemberMessageActor } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-member-message-actor.type';
import { type AgentChatPreparedMemberMessage } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-prepared-member-message.type';
import { type AgentChatMessageAddressing } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-message-addressing.type';
import { buildAgentChatAssistantReplyProviderMetadata } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-assistant-reply-provider-metadata.util';
import { resolveMessageSenderApplicationId } from 'src/engine/metadata-modules/ai/ai-chat/utils/resolve-message-sender-application-id.util';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentMessageStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-status.enum';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { mapUIMessagePartsToDBParts } from 'src/engine/metadata-modules/ai/ai-history/utils/map-ui-message-parts-to-db-parts.util';

@Injectable()
export class AgentChatMemberMessageWriterService {
  constructor(
    private readonly agentChatService: AgentChatService,
    private readonly chatThreadService: AgentChatThreadService,
    private readonly threadParticipantService: AgentChatThreadParticipantService,
    private readonly assistantParticipationService: AgentChatAssistantParticipationService,
    private readonly conversationWriterService: AgentConversationWriterService,
    private readonly inboxDeliveryService: AgentChatInboxDeliveryService,
    private readonly eventPublisherService: AgentChatEventPublisherService,
  ) {}

  async writeMemberMessage({
    actor,
    thread,
    message,
    placement,
    participation,
    addressing,
    assistantReplyContext,
  }: {
    actor: AgentChatMemberMessageActor;
    thread: AgentChatThreadWorkspaceEntity;
    message: AgentChatPreparedMemberMessage;
    placement: AgentChatMemberMessagePlacement;
    participation?: Pick<
      AgentChatAssistantParticipation,
      'isAssistantParticipant' | 'isInitialMessage'
    >;
    addressing?: AgentChatMessageAddressing;
    assistantReplyContext?: AgentChatAssistantReplyContext;
  }) {
    const threadAccess = {
      workspaceId: actor.workspaceId,
      workspaceMemberId: actor.workspaceMemberId,
      threadId: thread.id,
    };
    const messagePartsWithReplyContext = message.parts.map(
      (messagePart, partIndex) => {
        if (partIndex !== 0 || messagePart.type !== 'text') {
          return messagePart;
        }

        return {
          ...messagePart,
          providerMetadata: buildAgentChatAssistantReplyProviderMetadata(
            assistantReplyContext,
          ),
        };
      },
    );
    const persistedMessage =
      await this.conversationWriterService.runInTransaction({
        workspaceId: actor.workspaceId,
        threadId: thread.id,
        work: async (transactionScope) => {
          await this.threadParticipantService.resolveMentionInTransaction({
            ...threadAccess,
            scope: transactionScope,
          });

          if (isDefined(participation)) {
            await this.assistantParticipationService.persistAssistantParticipation(
              {
                workspaceId: actor.workspaceId,
                thread,
                participation,
                scope: transactionScope,
              },
            );
          }

          if (placement !== AgentChatMemberMessagePlacement.QUEUED) {
            return this.agentChatService.addMessage({
              ...actor,
              threadId: thread.id,
              id: message.id,
              uiMessage: {
                role: AgentMessageRole.USER,
                parts: messagePartsWithReplyContext,
              },
              turnStatus:
                placement === AgentChatMemberMessagePlacement.RUNNING
                  ? AgentTurnStatus.RUNNING
                  : AgentTurnStatus.COMPLETED,
              scope: transactionScope,
            });
          }

          const queuedMemberMessage = {
            id: message.id ?? randomUUID(),
            threadId: thread.id,
            turnId: null,
            role: AgentMessageRole.USER,
            agentId: null,
            status: AgentMessageStatus.QUEUED,
            senderWorkspaceMemberId: actor.workspaceMemberId,
            senderApplicationId: resolveMessageSenderApplicationId(actor),
          };

          await transactionScope.insert({
            name: 'agentMessage',
            values: queuedMemberMessage,
          });
          await transactionScope.insert({
            name: 'agentMessagePart',
            values: mapUIMessagePartsToDBParts(
              messagePartsWithReplyContext,
              queuedMemberMessage.id,
            ),
          });

          return queuedMemberMessage;
        },
      });
    let delivery: AgentChatInboxDeliveryResult = {
      deliveredMentionWorkspaceMemberIds: [],
      deliveredRecipientWorkspaceMemberIds: [],
    };

    if (isDefined(participation) && isDefined(addressing)) {
      const shouldDeliverToInitialRecipients =
        participation.isInitialMessage ||
        thread.conversationType ===
          AgentChatThreadConversationType.DIRECT_MESSAGE;

      delivery = await this.inboxDeliveryService.deliverMessageToInboxes({
        ...threadAccess,
        messageId: persistedMessage.id,
        mentionedWorkspaceMemberIds: addressing.mentionedWorkspaceMemberIds,
        initialRecipientWorkspaceMemberIds: shouldDeliverToInitialRecipients
          ? addressing.initialRecipientWorkspaceMemberIds
          : [],
      });
    }

    if (placement !== AgentChatMemberMessagePlacement.QUEUED) {
      await this.eventPublisherService.publish({
        workspaceId: actor.workspaceId,
        threadId: thread.id,
        event: {
          type:
            placement === AgentChatMemberMessagePlacement.RUNNING
              ? 'message-persisted'
              : 'message-added',
          messageId: persistedMessage.id,
        },
      });
    }

    await this.chatThreadService.notifyThreadActivityUpdated({
      ...threadAccess,
      text: message.text,
    });

    return { ...persistedMessage, delivery };
  }
}
