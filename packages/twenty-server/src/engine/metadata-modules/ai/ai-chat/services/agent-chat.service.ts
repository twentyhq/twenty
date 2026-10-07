import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { Injectable } from '@nestjs/common';
import { type ActorMetadata, FileFolder } from 'twenty-shared/types';

import { ExtendedUIMessage } from 'twenty-shared/ai';
import {
  isDefined,
  isNonEmptyArray,
  isNonEmptyString,
} from 'twenty-shared/utils';
import { In, Like, Not } from 'typeorm';

import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentMessageStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-status.enum';
import { AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { buildEndWaitingAgentTurnQuery } from 'src/engine/metadata-modules/ai/ai-history/utils/build-end-waiting-agent-turn-query.util';
import { buildActorMetadataFromAuthContext } from 'src/engine/core-modules/actor/utils/build-actor-metadata-from-auth-context.util';
import { AgentTurnWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-turn.workspace-entity';
import { mapUIMessagePartsToDBParts } from 'src/engine/metadata-modules/ai/ai-history/utils/map-ui-message-parts-to-db-parts.util';
import { findAwaitingPausingTool } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/find-awaiting-pausing-tool.util';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { AiChatFileAttachment } from 'src/engine/metadata-modules/ai/ai-chat/types/ai-chat-file-attachment.type';
import { AgentChatThreadRecordEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-record-event.service';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { AgentHistoryUpgradeFenceService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-upgrade-fence.service';
import { AgentTitleGenerationService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-title-generation.service';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';

@Injectable()
export class AgentChatService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentTurn')
    private readonly turnRepository: AgentHistoryRepository<AgentTurnWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentMessage')
    private readonly messageRepository: AgentHistoryRepository<AgentMessageWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentMessagePart')
    private readonly messagePartRepository: AgentHistoryRepository<AgentMessagePartWorkspaceEntity>,
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
    private readonly titleGenerationService: AgentTitleGenerationService,
    private readonly sharingService: AgentChatSharingService,
    private readonly threadRecordEventService: AgentChatThreadRecordEventService,
    private readonly conversationWriterService: AgentConversationWriterService,
    private readonly threadService: AgentChatThreadService,
    private readonly upgradeFenceService: AgentHistoryUpgradeFenceService,
  ) {}

  private getMessageSenderValues({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId?: string;
  }) {
    const context = workspaceAuthContextStorage.getStore();
    const applicationId =
      isDefined(context) &&
      isUserAuthContext(context) &&
      context.workspace.id === workspaceId &&
      context.userWorkspaceId === userWorkspaceId
        ? context.application?.id
        : undefined;
    return {
      senderUserWorkspaceId: userWorkspaceId ?? null,
      senderApplicationId: applicationId ?? null,
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
    agentId,
    turnId,
    turnStatus = AgentTurnStatus.RUNNING,
    id,
    workspaceId,
    userWorkspaceId,
  }: {
    threadId: string;
    uiMessage: Omit<ExtendedUIMessage, 'id'>;
    agentId?: string;
    turnId?: string;
    turnStatus?: AgentTurnStatus;
    id?: string;
    workspaceId: string;
    userWorkspaceId?: string;
  }) {
    const actualTurnId =
      turnId ??
      (await this.conversationWriterService.insertTurn({
        workspaceId,
        threadId,
        agentId: agentId ?? null,
        status: turnStatus,
        createdBy: this.getMessageSenderActor({ workspaceId, userWorkspaceId }),
      }));

    const senderValues = this.getMessageSenderValues({
      workspaceId,
      userWorkspaceId,
    });
    const processedAt = new Date();

    const savedMessageId = await this.conversationWriterService.insertMessage({
      workspaceId,
      id,
      threadId,
      turnId: actualTurnId,
      role: uiMessage.role as AgentMessageRole,
      agentId: agentId ?? null,
      ...senderValues,
      processedAt,
      parts: uiMessage.parts ?? [],
    });

    return {
      id: savedMessageId,
      threadId,
      turnId: actualTurnId,
      role: uiMessage.role as AgentMessageRole,
      agentId: agentId ?? null,
      processedAt: processedAt.toISOString(),
      ...senderValues,
    };
  }

  async upsertAssistantMessage({
    id,
    threadId,
    turnId,
    parts,
    workspaceId,
  }: {
    id: string;
    threadId: string;
    turnId: string;
    parts: ExtendedUIMessage['parts'];
    workspaceId: string;
  }): Promise<void> {
    const dbParts = mapUIMessagePartsToDBParts(parts, id);

    // the message is replaced whole, so no reader or crash ever finds it without its parts
    await this.conversationWriterService.runInTransaction(
      workspaceId,
      async (scope) => {
        await scope.upsert(
          'agentMessage',
          {
            id,
            threadId,
            turnId,
            role: AgentMessageRole.ASSISTANT,
            processedAt: new Date().toISOString(),
          },
          ['id'],
        );
        await scope.delete('agentMessagePart', { messageId: id });

        if (dbParts.length > 0) {
          await scope.insert('agentMessagePart', dbParts);
        }
      },
    );
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

    // hidden user messages are contexts the 2.46 upgrade has not turned into system messages yet
    const contextMessages = await this.messageRepository.find(workspaceId, {
      where: [
        { threadId, role: AgentMessageRole.SYSTEM },
        { threadId, isHidden: true },
      ],
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
      where: [
        { threadId, role: AgentMessageRole.SYSTEM },
        { threadId, isHidden: true },
      ],
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
      isHidden: false,
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
    return this.messageRepository.find(workspaceId, {
      where: {
        threadId,
        isHidden: false,
        role: Not(AgentMessageRole.SYSTEM),
      },
      order: { processedAt: { order: 'ASC', nulls: 'NULLS LAST' } },
      relations: ['parts', 'parts.file'],
    });
  }

  async queueMessage({
    threadId,
    text,
    id,
    fileAttachments,
    workspaceId,
    userWorkspaceId,
    workspaceMemberId,
  }: {
    threadId: string;
    text: string;
    id?: string;
    fileAttachments?: AiChatFileAttachment[];
    workspaceId: string;
    userWorkspaceId: string;
    workspaceMemberId: string;
  }) {
    const messageValues = {
      ...(id ? { id } : {}),
      threadId,
      turnId: null,
      role: AgentMessageRole.USER,
      agentId: null,
      status: AgentMessageStatus.QUEUED,
      ...this.getMessageSenderValues({ workspaceId, userWorkspaceId }),
    };

    const insertResult = await this.messageRepository.insert(
      workspaceId,
      messageValues,
    );

    const savedMessageId = (id ?? insertResult.identifiers[0].id) as string;

    const validFiles =
      fileAttachments && fileAttachments.length > 0
        ? await this.fileRepository.find(workspaceId, {
            where: {
              id: In(fileAttachments.map((attachment) => attachment.id)),
              path: Like(`${FileFolder.AgentChat}/%`),
            },
            select: ['id'],
          })
        : [];

    const validFileIds = new Set(validFiles.map((file) => file.id));

    const parts = [
      {
        messageId: savedMessageId,
        orderIndex: 0,
        type: 'text',
        textContent: text,
      },
      ...(fileAttachments ?? [])
        .filter((attachment) => validFileIds.has(attachment.id))
        .map((attachment, index) => ({
          messageId: savedMessageId,
          orderIndex: index + 1,
          type: 'file',
          fileId: attachment.id,
          fileFilename: attachment.filename,
        })),
    ];

    await this.messagePartRepository.insert(workspaceId, parts);

    await this.threadService.notifyThreadActivityUpdated({
      threadId,
      workspaceMemberId,
      workspaceId,
      text,
    });

    return {
      id: savedMessageId,
      ...messageValues,
    };
  }

  async hasQueuedMessages({
    threadId,
    workspaceId,
  }: {
    threadId: string;
    workspaceId: string;
  }): Promise<boolean> {
    return this.messageRepository.existsBy(workspaceId, {
      threadId,
      status: AgentMessageStatus.QUEUED,
    });
  }

  async getQueuedMessages({
    threadId,
    workspaceId,
  }: {
    threadId: string;
    workspaceId: string;
  }): Promise<AgentMessageWorkspaceEntity[]> {
    return this.messageRepository.find(workspaceId, {
      where: {
        threadId,
        status: AgentMessageStatus.QUEUED,
      },
      order: { createdAt: 'ASC' },
      relations: ['parts', 'parts.file'],
    });
  }

  async findQueuedMessage({
    messageId,
    workspaceId,
  }: {
    messageId: string;
    workspaceId: string;
  }): Promise<AgentMessageWorkspaceEntity | null> {
    return this.messageRepository.findOne(workspaceId, {
      where: { id: messageId, status: AgentMessageStatus.QUEUED },
    });
  }

  async deleteQueuedMessage({
    messageId,
    workspaceId,
  }: {
    messageId: string;
    workspaceId: string;
  }): Promise<boolean> {
    const result = await this.messageRepository.delete(workspaceId, {
      id: messageId,
      status: AgentMessageStatus.QUEUED,
    });

    return (result.affected ?? 0) > 0;
  }

  async promoteQueuedMessage({
    messageId,
    threadId,
    workspaceId,
  }: {
    messageId: string;
    threadId: string;
    workspaceId: string;
  }): Promise<string | null> {
    const savedTurnId = await this.conversationWriterService.insertTurn({
      workspaceId,
      threadId,
      agentId: null,
      status: AgentTurnStatus.RUNNING,
    });

    const result = await this.messageRepository.update(
      workspaceId,
      { id: messageId, threadId, status: AgentMessageStatus.QUEUED },
      {
        status: AgentMessageStatus.SENT,
        processedAt: new Date().toISOString(),
        turnId: savedTurnId,
      },
    );

    if ((result.affected ?? 0) === 0) {
      await this.turnRepository.delete(workspaceId, { id: savedTurnId });

      return null;
    }

    return savedTurnId;
  }

  async findAwaitingToolParts({
    messageId,
    workspaceId,
  }: {
    messageId: string;
    workspaceId: string;
  }): Promise<
    Pick<AgentMessagePartWorkspaceEntity, 'id' | 'toolName' | 'toolOutput'>[]
  > {
    const parts = await this.messagePartRepository.find(workspaceId, {
      where: { messageId },
      select: ['id', 'toolName', 'toolOutput'],
    });

    return parts.filter((part) => isDefined(findAwaitingPausingTool(part)));
  }

  // only a call still pending is claimed, so two answers can never both run it; the rest of the
  // pending output, such as the workflow step waiting on it, is kept
  async claimToolCallAnswer({
    partId,
    toolOutput,
    workspaceId,
  }: {
    partId: string;
    toolOutput: Record<string, unknown>;
    workspaceId: string;
  }): Promise<boolean> {
    const claimedParts = await this.messagePartRepository.query(
      workspaceId,
      ({ manager, table }) =>
        manager.query<{ id: string }[]>(
          `WITH claimed_part AS (UPDATE ${table('agentMessagePart')} SET "toolOutput" = "toolOutput" || $2::jsonb, "updatedAt" = now()
           WHERE id = $1 AND "toolOutput"->'result'->>'status' = 'pending' RETURNING id) SELECT id FROM claimed_part`,
          [partId, JSON.stringify(toolOutput)],
        ),
    );

    return claimedParts.length === 1;
  }

  // written together so an answer never strands a conversation waiting on answered calls
  async recordToolCallAnswer({
    threadId,
    messageId,
    partId,
    toolOutput,
    isLastAnswer,
    workspaceId,
  }: {
    threadId: string;
    messageId: string;
    partId: string;
    toolOutput: Record<string, unknown>;
    isLastAnswer: boolean;
    workspaceId: string;
  }): Promise<void> {
    const hasAgentTurnRunFields =
      await this.upgradeFenceService.hasUpgradedAgentHistory(workspaceId);

    const isPendingQuestionCleared = await this.messagePartRepository.query(
      workspaceId,
      async ({ manager, table }) => {
        await manager.query(
          `UPDATE ${table('agentMessagePart')} SET "toolOutput" = $2::jsonb, "updatedAt" = now() WHERE id = $1`,
          [partId, JSON.stringify(toolOutput)],
        );

        if (!isLastAnswer) {
          return false;
        }

        const clearedThreads = await manager.query<{ id: string }[]>(
          `WITH cleared AS (
             UPDATE ${table('agentChatThread')} SET "pendingQuestionMessageId" = NULL, "updatedAt" = now()
             WHERE id = $1 AND "pendingQuestionMessageId" = $2
             RETURNING id
           ) SELECT id FROM cleared`,
          [threadId, messageId],
        );

        if (clearedThreads.length === 0) {
          return false;
        }

        if (hasAgentTurnRunFields) {
          await manager.query(buildEndWaitingAgentTurnQuery({ table }), [
            messageId,
            AgentTurnStatus.COMPLETED,
          ]);
        }

        return true;
      },
    );

    if (isPendingQuestionCleared) {
      await this.threadRecordEventService.emitPendingQuestionCleared({
        workspaceId,
        threadId,
        messageId,
      });
    }
  }

  async restoreThread({
    threadId,
    workspaceMemberId,
    workspaceId,
  }: {
    threadId: string;
    workspaceMemberId: string;
    workspaceId: string;
  }): Promise<AgentChatThreadWorkspaceEntity> {
    // Access-checked writes return raw rows; record events carry ORM records
    const threadBefore = await this.threadRepository.findOne(workspaceId, {
      where: { id: threadId },
    });
    const thread = await this.sharingService.restoreThreadWithAccess({
      threadId,
      workspaceMemberId,
      workspaceId,
    });

    if (isDefined(threadBefore)) {
      await this.threadRecordEventService.emitThreadUpdated({
        workspaceId,
        threadBefore,
        action: DatabaseEventAction.RESTORED,
      });
    }

    return thread;
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
