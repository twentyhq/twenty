import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { Injectable, Logger } from '@nestjs/common';

import { ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In } from 'typeorm';
import type { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import type { UIDataTypes, UIMessagePart, UITools } from 'ai';

import { CodeInterpreterService } from 'src/engine/core-modules/code-interpreter/code-interpreter.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';
import {
  AgentMessageRole,
  AgentMessageStatus,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { AgentTurnWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-turn.workspace-entity';
import { mapUIMessagePartsToPersistedDBParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/map-ui-message-parts-to-persisted-db-parts.util';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { WorkspaceEventBroadcaster } from 'src/engine/subscriptions/workspace-event-broadcaster/workspace-event-broadcaster.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { serializeAgentChatThreadForBroadcast } from 'src/engine/metadata-modules/ai/ai-chat/utils/serialize-agent-chat-thread-for-broadcast.util';
import { AiChatFileAttachment } from 'src/engine/metadata-modules/ai/ai-chat/types/ai-chat-file-attachment.type';
import { AgentTitleGenerationService } from './agent-title-generation.service';
import { AgentChatThreadDTO } from '../dtos/agent-chat-thread.dto';

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
    private readonly workspaceEventBroadcaster: WorkspaceEventBroadcaster,
    private readonly codeInterpreterService: CodeInterpreterService,
    private readonly sharingService: AgentChatSharingService,
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
    const authContext = await this.sharingService.getAuthContext({
      workspaceId,
      workspaceMemberId,
    });
    const savedThread = await this.sharingService.createThread({
      workspaceId,
      workspaceMemberId,
      id,
      title,
    });

    await this.workspaceEventBroadcaster.broadcast({
      workspaceId,
      events: [
        {
          type: 'created',
          entityName: 'agentChatThread',
          recordId: savedThread.id,
          recipientUserWorkspaceIds: [authContext.userWorkspaceId],
          properties: {
            after: serializeAgentChatThreadForBroadcast({
              thread: savedThread,
              lastMessageAt: null,
            }),
          },
        },
      ],
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

  async getThreadsForMember({
    workspaceMemberId,
    workspaceId,
  }: {
    workspaceMemberId: string;
    workspaceId: string;
  }): Promise<
    (AgentChatThreadWorkspaceEntity & { lastMessageAt: Date | null })[]
  > {
    return this.getRankedThreads({ workspaceMemberId, workspaceId });
  }

  // Attachment, visibility, ranking and paging resolve in one query. Reading the
  // links first and filtering afterwards would page an arbitrary prefix of the
  // links rather than the ranked conversations, and would let one member's
  // attachments crowd everyone else's out of that prefix.
  async getThreadsAttachedToRecord({
    joinColumnName,
    recordId,
    workspaceMemberId,
    workspaceId,
    limit,
    offset,
  }: {
    joinColumnName: string;
    recordId: string;
    workspaceMemberId: string;
    workspaceId: string;
    limit?: number;
    offset?: number;
  }): Promise<
    (AgentChatThreadWorkspaceEntity & { lastMessageAt: Date | null })[]
  > {
    return this.getRankedThreads({
      attachedToRecord: { joinColumnName, recordId },
      workspaceMemberId,
      workspaceId,
      limit,
      offset,
    });
  }

  private async getRankedThreads({
    attachedToRecord,
    workspaceMemberId,
    workspaceId,
    limit,
    offset,
  }: {
    attachedToRecord?: { joinColumnName: string; recordId: string };
    workspaceMemberId: string;
    workspaceId: string;
    limit?: number;
    offset?: number;
  }): Promise<
    (AgentChatThreadWorkspaceEntity & { lastMessageAt: Date | null })[]
  > {
    const readableThreadIds = await this.sharingService.getReadableThreadIds({
      workspaceId,
      workspaceMemberId,
    });
    const rankedThreads = await this.threadRepository.query(
      workspaceId,
      async ({ manager, table }) => {
        const parameters: unknown[] = [readableThreadIds];
        const conditions = ['thread.id = ANY($1::uuid[])'];

        if (isDefined(attachedToRecord)) {
          parameters.push(attachedToRecord.recordId);

          conditions.push(
            `EXISTS (SELECT 1 FROM ${escapeIdentifier(getWorkspaceSchemaName(workspaceId))}."agentChatThreadTarget" target
             WHERE target."threadId" = thread.id
               AND target.${escapeIdentifier(attachedToRecord.joinColumnName)} = $${parameters.length}
               AND target."deletedAt" IS NULL)`,
          );
        }

        // The id breaks ties on both timestamps, without which two equally
        // ranked threads have no defined order and successive pages of that
        // order can repeat or skip one.
        let pagination = '';

        if (isDefined(limit)) {
          parameters.push(limit);
          pagination += ` LIMIT $${parameters.length}`;
        }

        if (isDefined(offset)) {
          parameters.push(offset);
          pagination += ` OFFSET $${parameters.length}`;
        }

        return manager.query<{ id: string; last_message_at: Date | null }[]>(
          `SELECT thread.id, MAX(message."createdAt") AS last_message_at
       FROM ${table('agentChatThread')} thread
       LEFT JOIN ${table('agentMessage')} message ON message."threadId" = thread.id AND message."isHidden" = false
       WHERE ${conditions.join(' AND ')}
       GROUP BY thread.id ORDER BY last_message_at DESC NULLS LAST, thread."updatedAt" DESC, thread.id DESC${pagination}`,
          parameters,
        );
      },
    );

    if (rankedThreads.length === 0) {
      return [];
    }

    const rankedThreadIds = rankedThreads.map(
      (rankedThread) => rankedThread.id,
    );

    const threads = await this.threadRepository.find(workspaceId, {
      where: { id: In(rankedThreadIds) },
    });

    const threadById = new Map(threads.map((thread) => [thread.id, thread]));

    return rankedThreads.flatMap((rankedThread) => {
      const thread = threadById.get(rankedThread.id);

      return isDefined(thread)
        ? [
            {
              ...thread,
              lastMessageAt: rankedThread.last_message_at ?? null,
            },
          ]
        : [];
    });
  }

  async getLastMessageAtForThread({
    threadId,
    workspaceId,
  }: {
    threadId: string;
    workspaceId: string;
  }): Promise<Date | null> {
    const [result] = await this.messageRepository.query(
      workspaceId,
      ({ manager, table }) =>
        manager.query<{ last_message_at: Date | null }[]>(
          `SELECT MAX("createdAt") AS last_message_at FROM ${table('agentMessage')}
       WHERE "threadId" = $1 AND "isHidden" = false`,
          [threadId],
        ),
    );

    return result?.last_message_at ?? null;
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

  async hasMessageById({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<boolean> {
    const existingMessage = await this.messageRepository.findOne(workspaceId, {
      where: { id },
      select: ['id'],
    });

    return isDefined(existingMessage);
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

  // A tool call id is only unique within the conversation that made it, so
  // the part is looked up through its message's thread.
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

  async updateToolPartOutput({
    partId,
    toolOutput,
    workspaceId,
  }: {
    partId: string;
    toolOutput: Record<string, unknown>;
    workspaceId: string;
  }): Promise<void> {
    await this.messagePartRepository.update(
      workspaceId,
      { id: partId },
      { toolOutput },
    );
  }

  async updateThreadTitle({
    threadId,
    workspaceMemberId,
    workspaceId,
    title,
  }: {
    threadId: string;
    workspaceMemberId: string;
    workspaceId: string;
    title: string;
  }): Promise<AgentChatThreadWorkspaceEntity> {
    const trimmed = title.trim();

    if (trimmed.length === 0) {
      throw new AiException(
        'Chat thread title cannot be empty',
        AiExceptionCode.INVALID_CHAT_THREAD_TITLE,
      );
    }

    const updated = await this.sharingService.updateThreadWithAccess({
      threadId,
      workspaceMemberId,
      workspaceId,
      operationType: 'update',
      changes: { title: trimmed },
    });

    await this.broadcastThreadUpdated(
      updated,
      workspaceId,
      ['title'],
      workspaceMemberId,
    );

    return updated;
  }

  async archiveThread({
    threadId,
    workspaceMemberId,
    workspaceId,
  }: {
    threadId: string;
    workspaceMemberId: string;
    workspaceId: string;
  }): Promise<AgentChatThreadWorkspaceEntity> {
    const thread = await this.sharingService.updateThreadWithAccess({
      threadId,
      workspaceMemberId,
      workspaceId,
      operationType: 'soft-delete',
      changes: { archivedAt: new Date(), activeStreamId: null },
    });

    await this.broadcastThreadUpdated(
      thread,
      workspaceId,
      ['deletedAt'],
      workspaceMemberId,
    );

    this.releaseThreadSandboxBestEffort(workspaceId, threadId);

    return thread;
  }

  async unarchiveThread({
    threadId,
    workspaceMemberId,
    workspaceId,
  }: {
    threadId: string;
    workspaceMemberId: string;
    workspaceId: string;
  }): Promise<AgentChatThreadWorkspaceEntity> {
    const thread = await this.sharingService.updateThreadWithAccess({
      threadId,
      workspaceMemberId,
      workspaceId,
      operationType: 'restore',
      changes: { archivedAt: null },
    });

    await this.broadcastThreadUpdated(
      thread,
      workspaceId,
      ['deletedAt'],
      workspaceMemberId,
    );

    return thread;
  }

  async hardDeleteThread({
    threadId,
    workspaceMemberId,
    workspaceId,
  }: {
    threadId: string;
    workspaceMemberId: string;
    workspaceId: string;
  }): Promise<void> {
    const authContext = await this.sharingService.getAuthContext({
      workspaceId,
      workspaceMemberId,
    });
    const thread = await this.sharingService.getThreadWithAccess({
      threadId,
      workspaceMemberId,
      workspaceId,
      operationType: 'delete',
    });

    const deleted = await this.sharingService.deleteThreadWithShares({
      workspaceId,
      threadId,
      workspaceMemberId,
    });

    if (!deleted) {
      this.logger.warn(
        `hardDeleteThread: thread ${threadId} vanished between fetch and delete`,
      );
      return;
    }

    await this.workspaceEventBroadcaster.broadcast({
      workspaceId,
      events: [
        {
          type: 'deleted',
          entityName: 'agentChatThread',
          recordId: threadId,
          recipientUserWorkspaceIds: [authContext.userWorkspaceId],
          properties: {
            before: serializeAgentChatThreadForBroadcast({
              thread,
              lastMessageAt: null,
            }),
          },
        },
      ],
    });

    this.releaseThreadSandboxBestEffort(workspaceId, threadId);
  }

  private releaseThreadSandboxBestEffort(
    workspaceId: string,
    threadId: string,
  ): void {
    void this.codeInterpreterService
      .releaseThreadSandbox(workspaceId, threadId)
      .catch((error) =>
        this.logger.warn(
          `Failed to release code interpreter sandbox for thread ${threadId}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        ),
      );
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

    await this.broadcastThreadUpdated(
      thread,
      workspaceId,
      ['lastMessageAt'],
      workspaceMemberId,
    );
  }

  async notifyThreadUsageUpdated({
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

    await this.broadcastThreadUpdated(
      thread,
      workspaceId,
      [
        'totalInputTokens',
        'totalOutputTokens',
        'totalInputCredits',
        'totalOutputCredits',
        'conversationSize',
        'contextWindowTokens',
      ],
      workspaceMemberId,
    );
  }

  private async broadcastThreadUpdated(
    thread: AgentChatThreadWorkspaceEntity,
    workspaceId: string,
    updatedFields: (keyof AgentChatThreadDTO)[],
    workspaceMemberId: string,
  ): Promise<void> {
    const authContext = await this.sharingService.getAuthContext({
      workspaceId,
      workspaceMemberId,
    });
    const permissions = await this.sharingService.getPermissions({
      workspaceId,
      workspaceMemberId,
      threadId: thread.id,
    });
    if (!permissions.canRead) {
      return;
    }
    const lastMessageAt = await this.getLastMessageAtForThread({
      threadId: thread.id,
      workspaceId,
    });

    await this.workspaceEventBroadcaster.broadcast({
      workspaceId,
      events: [
        {
          type: 'updated',
          entityName: 'agentChatThread',
          recordId: thread.id,
          recipientUserWorkspaceIds: [authContext.userWorkspaceId],
          properties: {
            updatedFields,
            after: serializeAgentChatThreadForBroadcast({
              thread,
              lastMessageAt,
            }),
          },
        },
      ],
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

    await this.broadcastThreadUpdated(
      { ...thread, title },
      workspaceId,
      ['title'],
      workspaceMemberId,
    );

    return title;
  }
}
