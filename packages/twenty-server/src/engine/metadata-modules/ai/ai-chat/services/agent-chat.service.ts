import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { AgentChatThreadParticipantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { Injectable, Logger } from '@nestjs/common';

import { ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In } from 'typeorm';
import type { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import type { UIDataTypes, UIMessagePart, UITools } from 'ai';

import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';
import {
  AgentMessageRole,
  AgentMessageStatus,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { AgentTurnWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-turn.workspace-entity';
import { mapUIMessagePartsToPersistedDBParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/map-ui-message-parts-to-persisted-db-parts.util';
import { PAUSING_TOOLS } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/constants/pausing-tools.constant';
import { skipAwaitingToolParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/skip-awaiting-tool-parts.util';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { AiChatFileAttachment } from 'src/engine/metadata-modules/ai/ai-chat/types/ai-chat-file-attachment.type';
import { AgentChatThreadRecordEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-record-event.service';
import { AgentTitleGenerationService } from './agent-title-generation.service';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';

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
    private readonly participantService: AgentChatThreadParticipantService,
  ) {}

  async createThread({
    workspaceMemberId,
    workspaceId,
    id,
    title,
  }: {
    workspaceMemberId: string;
    workspaceId: string;
    id?: string;
    title?: string;
  }) {
    const savedThread = await this.sharingService.createThread({
      workspaceId,
      workspaceMemberId,
      id,
      title,
    });

    await this.threadRecordEventService.emitThreadCreated({
      workspaceId,
      threadId: savedThread.id,
    });

    return savedThread;
  }

  async findWritableThread({
    threadId,
    workspaceMemberId,
    workspaceId,
  }: {
    threadId: string;
    workspaceMemberId: string;
    workspaceId: string;
  }) {
    try {
      return await this.sharingService.getThreadWithAccess({
        threadId,
        workspaceMemberId,
        workspaceId,
        operationType: 'update',
      });
    } catch (error) {
      if (
        error instanceof AiException &&
        error.code === AiExceptionCode.THREAD_NOT_FOUND
      ) {
        return null;
      }
      throw error;
    }
  }

  async getWritableThread(args: {
    threadId: string;
    workspaceMemberId: string;
    workspaceId: string;
  }) {
    return this.sharingService.getThreadWithAccess({
      ...args,
      operationType: 'update',
    });
  }

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
    processedAt,
    userWorkspaceId,
  }: {
    threadId: string;
    uiMessage: Omit<ExtendedUIMessage, 'id'>;
    uiMessageParts?: UIMessagePart<UIDataTypes, UITools>[];
    agentId?: string;
    turnId?: string;
    id?: string;
    workspaceId: string;
    isHidden?: boolean;
    processedAt?: Date;
    userWorkspaceId?: string;
  }) {
    let actualTurnId = turnId;

    if (!actualTurnId) {
      const turnInsertResult = await this.turnRepository.insert(workspaceId, {
        threadId,
        agentId: agentId ?? null,
      });

      actualTurnId = turnInsertResult.identifiers[0].id as string;
    }

    const messageValues = {
      ...(id ? { id } : {}),
      threadId,
      turnId: actualTurnId,
      role: uiMessage.role as AgentMessageRole,
      agentId: agentId ?? null,
      processedAt: (processedAt ?? new Date()).toISOString(),
      ...this.getMessageSenderValues({ workspaceId, userWorkspaceId }),
      ...(isDefined(isHidden) ? { isHidden } : {}),
    };

    const insertResult = await this.messageRepository.insert(
      workspaceId,
      messageValues,
    );

    const savedMessageId = (id ?? insertResult.identifiers[0].id) as string;

    if (uiMessage.parts && uiMessage.parts.length > 0) {
      const dbParts = mapUIMessagePartsToPersistedDBParts(
        uiMessage.parts,
        savedMessageId,
        workspaceId,
      );

      if (dbParts.length > 0) {
        await this.messagePartRepository.insert(
          workspaceId,
          dbParts as QueryDeepPartialEntity<AgentMessagePartWorkspaceEntity>[],
        );
      }
    }

    return {
      id: savedMessageId,
      threadId,
      turnId: actualTurnId,
      role: uiMessage.role as AgentMessageRole,
      agentId: agentId ?? null,
      processedAt: messageValues.processedAt,
      senderUserWorkspaceId: messageValues.senderUserWorkspaceId,
      senderApplicationId: messageValues.senderApplicationId,
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
    await this.messageRepository.upsert(
      workspaceId,
      {
        id,
        threadId,
        turnId,
        role: AgentMessageRole.ASSISTANT,
        processedAt: new Date().toISOString(),
      },
      ['id'],
    );

    await this.messagePartRepository.delete(workspaceId, { messageId: id });

    const dbParts = mapUIMessagePartsToPersistedDBParts(parts, id, workspaceId);

    if (dbParts.length > 0) {
      await this.messagePartRepository.insert(
        workspaceId,
        dbParts as QueryDeepPartialEntity<AgentMessagePartWorkspaceEntity>[],
      );
    }
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
      await this.getWritableThread({
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

    const savedMessage = await this.addMessage({
      threadId,
      workspaceId,
      userWorkspaceId,
      uiMessage: {
        role: AgentMessageRole.USER,
        parts: [{ type: 'text' as const, text }],
      },
      isHidden: true,
    });

    if (!isDefined(savedMessage.turnId)) {
      throw new AiException(
        'Workspace setup kickoff message was persisted without a turn',
        AiExceptionCode.MESSAGE_NOT_FOUND,
      );
    }

    return { id: savedMessage.id, turnId: savedMessage.turnId };
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

    await this.notifyThreadActivityUpdated({
      threadId,
      workspaceMemberId,
      workspaceId,
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

  async deleteMessage({
    messageId,
    workspaceId,
  }: {
    messageId: string;
    workspaceId: string;
  }): Promise<void> {
    await this.messageRepository.delete(workspaceId, { id: messageId });
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
    const turnInsertResult = await this.turnRepository.insert(workspaceId, {
      threadId,
      agentId: null,
    });

    const savedTurnId = turnInsertResult.identifiers[0].id as string;

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
  }): Promise<
    | (Pick<
        AgentMessagePartWorkspaceEntity,
        'id' | 'messageId' | 'toolName' | 'toolInput' | 'toolOutput'
      > & { turnId: string | null })
    | null
  > {
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
      select: ['id', 'turnId'],
    });

    const part = parts.find((candidate) => candidate.messageId === message?.id);

    return isDefined(part) && isDefined(message)
      ? { ...part, turnId: message.turnId }
      : null;
  }

  async findAwaitingToolParts({
    messageId,
    workspaceId,
  }: {
    messageId: string;
    workspaceId: string;
  }): Promise<
    Pick<
      AgentMessagePartWorkspaceEntity,
      'id' | 'toolName' | 'toolCallId' | 'toolInput'
    >[]
  > {
    const parts = await this.messagePartRepository.find(workspaceId, {
      where: { messageId },
      select: ['id', 'toolName', 'toolCallId', 'toolInput', 'toolOutput'],
    });

    return parts.filter(
      (part) =>
        isDefined(part.toolName) &&
        (PAUSING_TOOLS.get(part.toolName)?.isAwaitingOutput(part.toolOutput) ??
          false),
    );
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
  }

  async closePendingToolCalls({
    threadId,
    messageId,
    workspaceId,
  }: {
    threadId: string;
    messageId: string;
    workspaceId: string;
  }): Promise<void> {
    await this.threadRepository.update(
      workspaceId,
      { id: threadId, pendingQuestionMessageId: messageId },
      { pendingQuestionMessageId: null },
    );

    await skipAwaitingToolParts({
      messagePartRepository: this.messagePartRepository,
      messageId,
      workspaceId,
    });
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

  async notifyThreadActivityUpdated({
    threadId,
    workspaceMemberId,
    workspaceId,
  }: {
    threadId: string;
    workspaceMemberId: string;
    workspaceId: string;
  }): Promise<void> {
    const thread = await this.getWritableThread({
      threadId,
      workspaceMemberId,
      workspaceId,
    });

    // Conversations are listed by last activity, so a message moves its
    // conversation to the top when it is sent, not only once the turn ends.
    const { lastActivityAt, updatedAt } =
      await this.participantService.recordMemberActivity({
        threadId,
        workspaceMemberId,
        workspaceId,
      });

    const threadAfter = {
      ...thread,
      lastActivityAt: lastActivityAt?.toISOString() ?? thread.lastActivityAt,
      updatedAt: updatedAt.toISOString(),
    };

    await this.threadRecordEventService.emitThreadUpdated({
      workspaceId,
      threadBefore: thread,
      threadAfter,
    });
  }

  hasThreadInboxState(workspaceId: string): Promise<boolean> {
    return this.participantService.hasInboxState(workspaceId);
  }

  recordThreadActivity(args: {
    workspaceId: string;
    threadId: string;
  }): Promise<void> {
    return this.participantService.recordThreadActivity(args);
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
    const thread = await this.getWritableThread({
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
    workspaceMemberId,
  }: {
    threadId: string;
    messageContent: string;
    workspaceId: string;
    workspaceMemberId: string;
  }): Promise<string | null> {
    const thread = await this.threadRepository.findOne(workspaceId, {
      where: { id: threadId },
    });

    if (!thread || thread.title || !messageContent) {
      return null;
    }

    const authContext = await this.sharingService.getAuthContext({
      workspaceId,
      workspaceMemberId,
    });
    const title = await this.titleGenerationService.generateThreadTitle(
      messageContent,
      workspaceId,
      authContext.userWorkspaceId,
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
