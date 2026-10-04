import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { Injectable, Logger } from '@nestjs/common';

import { ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { type FindOptionsWhere, In } from 'typeorm';

import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentMessageStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-status.enum';
import { AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { AgentTurnWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-turn.workspace-entity';
import { mapUIMessagePartsToDBParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/map-ui-message-parts-to-db-parts.util';
import { findAwaitingPausingTool } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/find-awaiting-pausing-tool.util';
import { closeOpenToolParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/close-open-tool-parts.util';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { AiChatFileAttachment } from 'src/engine/metadata-modules/ai/ai-chat/types/ai-chat-file-attachment.type';
import { AgentChatThreadRecordEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-record-event.service';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { AgentTitleGenerationService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-title-generation.service';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { formatErrorWithCause } from 'src/engine/metadata-modules/ai/ai-chat/utils/format-error-with-cause.util';

@Injectable()
export class AgentChatService {
  private readonly logger = new Logger(AgentChatService.name);

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

  async addMessage({
    threadId,
    uiMessage,
    agentId,
    turnId,
    id,
    workspaceId,
    isHidden,
    userWorkspaceId,
  }: {
    threadId: string;
    uiMessage: Omit<ExtendedUIMessage, 'id'>;
    agentId?: string;
    turnId?: string;
    id?: string;
    workspaceId: string;
    isHidden?: boolean;
    userWorkspaceId?: string;
  }) {
    const actualTurnId =
      turnId ??
      (await this.conversationWriterService.insertTurn({
        workspaceId,
        threadId,
        agentId: agentId ?? null,
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
      isHidden,
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

  async findLatestSentUserMessage({
    threadId,
    workspaceId,
  }: {
    threadId: string;
    workspaceId: string;
  }): Promise<Pick<AgentMessageWorkspaceEntity, 'id' | 'turnId'> | null> {
    return this.messageRepository.findOne(workspaceId, {
      where: {
        threadId,
        role: AgentMessageRole.USER,
        status: AgentMessageStatus.SENT,
      },
      order: {
        processedAt: { order: 'DESC', nulls: 'NULLS LAST' },
        createdAt: 'DESC',
        id: 'DESC',
      },
      select: ['id', 'turnId'],
    });
  }

  async hasConversationMessages({
    threadId,
    workspaceId,
  }: {
    threadId: string;
    workspaceId: string;
  }): Promise<boolean> {
    const visibleMessage = await this.messageRepository.findOne(workspaceId, {
      where: { threadId, isHidden: false },
      select: ['id'],
    });

    return isDefined(visibleMessage);
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
    includeHidden = false,
  }: {
    threadId: string;
    workspaceMemberId: string;
    workspaceId: string;
    includeHidden?: boolean;
  }) {
    if (includeHidden) {
      await this.threadService.getWritableThread({
        threadId,
        workspaceMemberId,
        workspaceId,
      });
    } else {
      await this.sharingService.getReadableThread({
        threadId,
        workspaceMemberId,
        workspaceId,
      });
    }

    return this.messageRepository.find(workspaceId, {
      where: { threadId, ...(includeHidden ? {} : { isHidden: false }) },
      order: { processedAt: { order: 'ASC', nulls: 'NULLS LAST' } },
      relations: ['parts', 'parts.file'],
    });
  }

  async ensureHiddenKickoffMessage({
    threadId,
    workspaceId,
    text,
    userWorkspaceId,
  }: {
    threadId: string;
    workspaceId: string;
    text: string;
    userWorkspaceId: string;
  }): Promise<{ id: string; turnId: string }> {
    const existingKickoffMessage = await this.messageRepository.findOne(
      workspaceId,
      {
        where: { threadId, isHidden: true },
        relations: ['parts'],
      },
    );

    if (isDefined(existingKickoffMessage)) {
      if (
        isDefined(existingKickoffMessage.turnId) &&
        isNonEmptyArray(existingKickoffMessage.parts)
      ) {
        return {
          id: existingKickoffMessage.id,
          turnId: existingKickoffMessage.turnId,
        };
      }

      await this.messageRepository.delete(workspaceId, {
        id: existingKickoffMessage.id,
      });

      if (isDefined(existingKickoffMessage.turnId)) {
        await this.turnRepository.delete(workspaceId, {
          id: existingKickoffMessage.turnId,
        });
      }
    }

    const { id, turnId } = await this.addMessage({
      threadId,
      workspaceId,
      userWorkspaceId,
      uiMessage: {
        role: AgentMessageRole.USER,
        parts: [{ type: 'text' as const, text }],
      },
      isHidden: true,
    });

    return { id, turnId };
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

  // tool call ids are only unique within a conversation
  async findToolPart({
    threadId,
    toolCallId,
    workspaceId,
  }: {
    threadId: string;
    toolCallId: string;
    workspaceId: string;
  }): Promise<Pick<
    AgentMessagePartWorkspaceEntity,
    'id' | 'messageId' | 'toolName' | 'toolInput' | 'toolOutput'
  > | null> {
    const parts = await this.messagePartRepository.find(workspaceId, {
      where: { toolCallId },
      select: ['id', 'messageId', 'toolName', 'toolInput', 'toolOutput'],
    });

    if (!isNonEmptyArray(parts)) {
      return null;
    }

    const message = await this.messageRepository.findOne(workspaceId, {
      where: {
        id: In(parts.map((part) => part.messageId)),
        threadId,
      },
      select: ['id'],
    });

    return (
      parts.find((candidate) => candidate.messageId === message?.id) ?? null
    );
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
    const threadBefore = isLastAnswer
      ? await this.threadRepository.findOne(workspaceId, {
          where: { id: threadId },
        })
      : null;

    await this.messagePartRepository.query(
      workspaceId,
      async ({ manager, table }) => {
        await manager.query(
          `UPDATE ${table('agentMessagePart')} SET "toolOutput" = $2::jsonb, "updatedAt" = now() WHERE id = $1`,
          [partId, JSON.stringify(toolOutput)],
        );

        if (isLastAnswer) {
          await manager.query(
            `UPDATE ${table('agentChatThread')} SET "pendingQuestionMessageId" = NULL, "updatedAt" = now() WHERE id = $1 AND "pendingQuestionMessageId" = $2`,
            [threadId, messageId],
          );
        }
      },
    );

    if (isDefined(threadBefore)) {
      await this.emitPendingQuestionCleared({ workspaceId, threadBefore });
    }
  }

  // clearing the marker is the claim, so only one caller closes the calls
  async closePendingToolCalls({
    threadId,
    messageId,
    workspaceId,
    where = {},
  }: {
    threadId: string;
    messageId: string;
    workspaceId: string;
    where?: FindOptionsWhere<AgentChatThreadWorkspaceEntity>;
  }): Promise<void> {
    const threadBefore = await this.threadRepository.findOne(workspaceId, {
      where: { id: threadId },
    });
    const claim = await this.threadRepository.update(
      workspaceId,
      { id: threadId, pendingQuestionMessageId: messageId, ...where },
      { pendingQuestionMessageId: null },
    );

    if (!claim.affected) {
      return;
    }

    await closeOpenToolParts({
      messagePartRepository: this.messagePartRepository,
      messageId,
      workspaceId,
    });

    if (isDefined(threadBefore)) {
      await this.emitPendingQuestionCleared({ workspaceId, threadBefore });
    }
  }

  // Chat lists show which chats wait on an answer. The calls are already
  // closed, so a lost event must not fail the caller
  private async emitPendingQuestionCleared({
    workspaceId,
    threadBefore,
  }: {
    workspaceId: string;
    threadBefore: AgentChatThreadWorkspaceEntity;
  }): Promise<void> {
    await this.threadRecordEventService
      .emitThreadUpdated({ workspaceId, threadBefore })
      .catch((error: unknown) =>
        this.logger.warn(
          `Could not emit the cleared question on thread ${threadBefore.id}: ${formatErrorWithCause(error)}`,
        ),
      );
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
