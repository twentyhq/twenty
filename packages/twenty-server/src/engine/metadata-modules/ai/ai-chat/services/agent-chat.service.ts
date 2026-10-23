import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { Injectable } from '@nestjs/common';
import { type ActorMetadata } from 'twenty-shared/types';

import { ExtendedUIMessage } from 'twenty-shared/ai';
import {
  isDefined,
  isNonEmptyArray,
  isNonEmptyString,
} from 'twenty-shared/utils';
import { In, Not } from 'typeorm';

import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { buildActorMetadataFromAuthContext } from 'src/engine/core-modules/actor/utils/build-actor-metadata-from-auth-context.util';
import { AgentTurnWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-turn.workspace-entity';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { AgentChatThreadRecordEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-record-event.service';
import { filterPartsOfTurnActedByOthers } from 'src/engine/metadata-modules/ai/ai-history/utils/filter-parts-of-turn-acted-by-others.util';
import { resolveMessageSenderApplicationId } from 'src/engine/metadata-modules/ai/ai-chat/utils/resolve-message-sender-application-id.util';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { AgentTitleGenerationService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-title-generation.service';

@Injectable()
export class AgentChatService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentTurn')
    private readonly turnRepository: AgentHistoryRepository<AgentTurnWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentMessage')
    private readonly messageRepository: AgentHistoryRepository<AgentMessageWorkspaceEntity>,
    private readonly titleGenerationService: AgentTitleGenerationService,
    private readonly sharingService: AgentChatSharingService,
    private readonly threadRecordEventService: AgentChatThreadRecordEventService,
    private readonly conversationWriterService: AgentConversationWriterService,
    private readonly threadService: AgentChatThreadService,
  ) {}

  private getMessageSenderValues({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId?: string;
  }) {
    return {
      senderUserWorkspaceId: userWorkspaceId ?? null,
      senderApplicationId: resolveMessageSenderApplicationId({
        workspaceId,
        userWorkspaceId,
      }),
    };
  }

  private getMessageSenderActor({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId?: string;
  }): ActorMetadata | undefined {
    const context = workspaceAuthContextStorage.getStore();

    return isDefined(context) &&
      isUserAuthContext(context) &&
      context.workspace.id === workspaceId &&
      context.userWorkspaceId === userWorkspaceId
      ? buildActorMetadataFromAuthContext(context)
      : undefined;
  }

  // A message opening its own turn runs the agent unless the caller says nothing will
  async addMessage({
    threadId,
    uiMessage,
    turnStatus = AgentTurnStatus.RUNNING,
    id,
    workspaceId,
    userWorkspaceId,
  }: {
    threadId: string;
    uiMessage: Omit<ExtendedUIMessage, 'id'>;
    turnStatus?: AgentTurnStatus;
    id?: string;
    workspaceId: string;
    userWorkspaceId?: string;
  }) {
    const turnId = await this.conversationWriterService.insertTurn({
      workspaceId,
      threadId,
      agentId: null,
      status: turnStatus,
      createdBy: this.getMessageSenderActor({ workspaceId, userWorkspaceId }),
    });

    const senderValues = this.getMessageSenderValues({
      workspaceId,
      userWorkspaceId,
    });
    const processedAt = new Date();

    const savedMessageId = await this.conversationWriterService.insertMessage({
      workspaceId,
      id,
      threadId,
      turnId,
      role: uiMessage.role as AgentMessageRole,
      agentId: null,
      ...senderValues,
      processedAt,
      parts: uiMessage.parts ?? [],
    });

    return {
      id: savedMessageId,
      threadId,
      turnId,
      role: uiMessage.role as AgentMessageRole,
      agentId: null,
      processedAt: processedAt.toISOString(),
      ...senderValues,
    };
  }

  // the contexts are the thread owner's, so the turns of other participants run without them
  async getThreadContexts({
    threadId,
    workspaceMemberId,
    workspaceId,
  }: {
    threadId: string;
    workspaceMemberId: string;
    workspaceId: string;
  }): Promise<string[]> {
    const thread = await this.threadRepository.findOne(workspaceId, {
      where: { id: threadId },
      select: ['id', 'workspaceMemberId'],
    });

    if (thread?.workspaceMemberId !== workspaceMemberId) {
      return [];
    }

    const contextMessages = await this.messageRepository.find(workspaceId, {
      where: { threadId, role: AgentMessageRole.SYSTEM },
      order: { createdAt: 'ASC', id: 'ASC' },
      relations: ['parts'],
    });

    return contextMessages.flatMap(({ parts }) => {
      const context = (parts ?? [])
        .sort((first, second) => first.orderIndex - second.orderIndex)
        .flatMap(({ textContent }) =>
          isNonEmptyString(textContent) ? [textContent] : [],
        )
        .join('\n\n');

      return isNonEmptyString(context) ? [context] : [];
    });
  }

  // an earlier attempt that never got an answer left only its context, which would repeat
  async replaceOpeningTurn({
    threadId,
    workspaceId,
    context,
  }: {
    threadId: string;
    workspaceId: string;
    context: string;
  }): Promise<string> {
    // only the contexts and their turns go, so a message queued meanwhile stays
    const earlierContexts = await this.messageRepository.find(workspaceId, {
      where: { threadId, role: AgentMessageRole.SYSTEM },
      select: ['id', 'turnId'],
    });

    if (isNonEmptyArray(earlierContexts)) {
      await this.messageRepository.delete(workspaceId, {
        id: In(earlierContexts.map(({ id }) => id)),
      });
    }

    const earlierTurnIds = earlierContexts.flatMap(({ turnId }) =>
      isDefined(turnId) ? [turnId] : [],
    );

    if (isNonEmptyArray(earlierTurnIds)) {
      await this.turnRepository.delete(workspaceId, {
        id: In(earlierTurnIds),
      });
    }

    return this.conversationWriterService.insertAgentOpenedTurn({
      workspaceId,
      threadId,
      context,
    });
  }

  async hasMessages({
    threadId,
    workspaceId,
  }: {
    threadId: string;
    workspaceId: string;
  }): Promise<boolean> {
    return this.messageRepository.existsBy(workspaceId, {
      threadId,
      role: Not(AgentMessageRole.SYSTEM),
    });
  }

  async deleteAssistantMessagesForTurn({
    turnId,
    workspaceId,
  }: {
    turnId: string;
    workspaceId: string;
  }): Promise<void> {
    await this.messageRepository.delete(workspaceId, {
      turnId,
      role: AgentMessageRole.ASSISTANT,
    });
  }

  async getMessagesForThread({
    threadId,
    workspaceMemberId,
    workspaceId,
  }: {
    threadId: string;
    workspaceMemberId: string;
    workspaceId: string;
  }) {
    await this.sharingService.getReadableThread({
      threadId,
      workspaceMemberId,
      workspaceId,
    });

    // contexts are given to the model, never shown
    const [messages, turns] = await Promise.all([
      this.messageRepository.find(workspaceId, {
        where: {
          threadId,
          role: Not(AgentMessageRole.SYSTEM),
        },
        order: { processedAt: { order: 'ASC', nulls: 'NULLS LAST' } },
        relations: ['parts', 'parts.file'],
      }),
      this.turnRepository.find(workspaceId, { where: { threadId } }),
    ]);
    // the opener is stamped on the turn, so a run resumed in a new turn after a pause is still theirs
    const turnIdsOpenedByOtherMembers = new Set(
      turns
        .filter(
          ({ createdBy }) =>
            isDefined(createdBy.workspaceMemberId) &&
            createdBy.workspaceMemberId !== workspaceMemberId,
        )
        .map(({ id }) => id),
    );

    // their message and attachments are theirs to show; only the reply ran under their permissions
    return messages.map((message) => {
      if (
        !isDefined(message.turnId) ||
        !turnIdsOpenedByOtherMembers.has(message.turnId) ||
        message.role === AgentMessageRole.USER
      ) {
        return message;
      }

      return {
        ...message,
        parts: filterPartsOfTurnActedByOthers(message.parts ?? []),
      };
    });
  }

  async notifyThreadUsageUpdated({
    threadBefore,
    workspaceMemberId,
    workspaceId,
  }: {
    threadBefore: AgentChatThreadWorkspaceEntity;
    workspaceMemberId: string;
    workspaceId: string;
  }): Promise<void> {
    const threadId = threadBefore.id;
    const thread = await this.threadService.getWritableThread({
      threadId,
      workspaceMemberId,
      workspaceId,
    });

    await this.threadRecordEventService.emitThreadUpdated({
      workspaceId,
      threadBefore,
      threadAfter: thread,
    });
  }

  async generateTitleIfNeeded({
    threadId,
    messageContent,
    workspaceId,
    userWorkspaceId,
  }: {
    threadId: string;
    messageContent: string;
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<string | null> {
    const thread = await this.threadRepository.findOne(workspaceId, {
      where: { id: threadId },
    });

    if (!thread || thread.title || !messageContent) {
      return null;
    }

    const title = await this.titleGenerationService.generateThreadTitle(
      messageContent,
      workspaceId,
      userWorkspaceId,
    );

    await this.threadRepository.update(
      workspaceId,
      { id: threadId },
      { title },
    );

    await this.threadRecordEventService.emitThreadUpdated({
      workspaceId,
      threadBefore: thread,
    });

    return title;
  }
}
