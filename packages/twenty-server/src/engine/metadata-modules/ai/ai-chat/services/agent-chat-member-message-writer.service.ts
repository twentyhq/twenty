import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { isDefined } from 'twenty-shared/utils';

import { AgentChatAssistantParticipationService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-assistant-participation.service';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatInboxDeliveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-inbox-delivery.service';
import { AgentChatMemberMessagePartsService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-member-message-parts.service';
import { AgentChatThreadParticipantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { type AgentChatAssistantParticipation } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-assistant-participation.type';
import { type AgentChatMemberMessageActor } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-member-message-actor.type';
import { type AgentChatMemberMessage } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-member-message.type';
import { type AgentChatMessageAddressing } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-message-addressing.type';
import { resolveMessageSenderApplicationId } from 'src/engine/metadata-modules/ai/ai-chat/utils/resolve-message-sender-application-id.util';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentMessageStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-status.enum';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { mapUIMessagePartsToDBParts } from 'src/engine/metadata-modules/ai/ai-history/utils/map-ui-message-parts-to-db-parts.util';

@Injectable()
export class AgentChatMemberMessageWriterService {
  @Inject(AgentChatService)
  private readonly chatService: AgentChatService;

  @Inject(AgentChatThreadService)
  private readonly threadService: AgentChatThreadService;

  @Inject(AgentChatThreadParticipantService)
  private readonly participantService: AgentChatThreadParticipantService;

  @Inject(AgentChatAssistantParticipationService)
  private readonly assistantParticipationService: AgentChatAssistantParticipationService;

  @Inject(AgentConversationWriterService)
  private readonly conversationWriterService: AgentConversationWriterService;

  @Inject(AgentChatMemberMessagePartsService)
  private readonly messagePartsService: AgentChatMemberMessagePartsService;

  @Inject(AgentChatInboxDeliveryService)
  private readonly inboxDeliveryService: AgentChatInboxDeliveryService;

  @Inject(AgentChatEventPublisherService)
  private readonly eventPublisherService: AgentChatEventPublisherService;

  async write({
    actor,
    thread,
    message,
    placement,
    participation,
    addressing,
  }: {
    actor: AgentChatMemberMessageActor;
    thread: AgentChatThreadWorkspaceEntity;
    message: AgentChatMemberMessage;
    placement: 'queued' | 'running' | 'completed';
    participation?: AgentChatAssistantParticipation;
    addressing?: AgentChatMessageAddressing;
  }) {
    const access = {
      workspaceId: actor.workspaceId,
      workspaceMemberId: actor.workspaceMemberId,
      threadId: thread.id,
    };
    const parts = await this.messagePartsService.build({
      workspaceId: actor.workspaceId,
      message,
    });
    const savedMessage = await this.conversationWriterService.runInTransaction(
      actor.workspaceId,
      async (scope) => {
        await this.participantService.resolveMentionInTransaction({
          ...access,
          scope,
        });

        if (isDefined(participation)) {
          await this.assistantParticipationService.save({
            workspaceId: actor.workspaceId,
            thread,
            participation,
            scope,
          });
        }

        if (placement !== 'queued') {
          return this.chatService.addMessage({
            ...actor,
            threadId: thread.id,
            id: message.id,
            uiMessage: { role: AgentMessageRole.USER, parts },
            turnStatus:
              placement === 'running'
                ? AgentTurnStatus.RUNNING
                : AgentTurnStatus.COMPLETED,
            scope,
          });
        }

        const queuedMessage = {
          id: message.id ?? randomUUID(),
          threadId: thread.id,
          turnId: null,
          role: AgentMessageRole.USER,
          agentId: null,
          status: AgentMessageStatus.QUEUED,
          senderWorkspaceMemberId: actor.workspaceMemberId,
          senderApplicationId: resolveMessageSenderApplicationId(actor),
        };

        await scope.insert('agentMessage', queuedMessage);
        await scope.insert(
          'agentMessagePart',
          mapUIMessagePartsToDBParts(parts, queuedMessage.id),
        );

        return queuedMessage;
      },
    );
    const delivery =
      isDefined(participation) && isDefined(addressing)
        ? await this.inboxDeliveryService.deliver({
            ...access,
            messageId: savedMessage.id,
            mentionedWorkspaceMemberIds: addressing.mentionedWorkspaceMemberIds,
            initialRecipientWorkspaceMemberIds: participation.isInitialMessage
              ? addressing.initialRecipientWorkspaceMemberIds
              : [],
          })
        : {
            deliveredMentionWorkspaceMemberIds: [],
            deliveredRecipientWorkspaceMemberIds: [],
          };

    if (placement !== 'queued') {
      await this.eventPublisherService.publish({
        workspaceId: actor.workspaceId,
        threadId: thread.id,
        event: {
          type: placement === 'running' ? 'message-persisted' : 'message-added',
          messageId: savedMessage.id,
        },
      });
    }

    await this.threadService.notifyThreadActivityUpdated({
      ...access,
      text: message.text,
    });

    return { ...savedMessage, delivery };
  }
}
