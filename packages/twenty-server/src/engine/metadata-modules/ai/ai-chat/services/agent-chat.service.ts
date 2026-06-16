import { Injectable, Logger } from '@nestjs/common';

import { ExtendedUIMessage } from 'twenty-shared/ai';
import { In, IsNull, Not } from 'typeorm';
import type { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import type { UIDataTypes, UIMessagePart, UITools } from 'ai';

import { CodeInterpreterService } from 'src/engine/core-modules/code-interpreter/code-interpreter.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { AgentMessagePartEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message-part.entity';
import {
  AgentMessageEntity,
  AgentMessageRole,
  AgentMessageStatus,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { AgentTurnEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-turn.entity';
import { finalizeDanglingToolParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/finalize-dangling-tool-parts.util';
import { mapUIMessagePartsToDBParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/mapUIMessagePartsToDBParts';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { WorkspaceEventBroadcaster } from 'src/engine/subscriptions/workspace-event-broadcaster/workspace-event-broadcaster.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';
import { AiChatFileAttachment } from 'src/engine/metadata-modules/ai/ai-chat/types/ai-chat-file-attachment.type';
import { AgentTitleGenerationService } from './agent-title-generation.service';
import { AgentChatThreadDTO } from '../dtos/agent-chat-thread.dto';

const serializeThreadForBroadcast = (
  thread: AgentChatThreadEntity,
  lastMessageAt: Date | null,
) => ({
  id: thread.id,
  title: thread.title,
  totalInputTokens: thread.totalInputTokens,
  totalOutputTokens: thread.totalOutputTokens,
  totalCacheReadTokens: thread.totalCacheReadTokens,
  totalCacheCreationTokens: thread.totalCacheCreationTokens,
  contextWindowTokens: thread.contextWindowTokens,
  conversationSize: thread.conversationSize,
  totalInputCredits: toDisplayCredits(thread.totalInputCredits),
  totalOutputCredits: toDisplayCredits(thread.totalOutputCredits),
  deletedAt: thread.deletedAt,
  lastMessageAt,
  createdAt: thread.createdAt,
  updatedAt: thread.updatedAt,
});

@Injectable()
export class AgentChatService {
  private readonly logger = new Logger(AgentChatService.name);

  constructor(
    @InjectWorkspaceScopedRepository(AgentChatThreadEntity)
    private readonly threadRepository: WorkspaceScopedRepository<AgentChatThreadEntity>,
    @InjectWorkspaceScopedRepository(AgentTurnEntity)
    private readonly turnRepository: WorkspaceScopedRepository<AgentTurnEntity>,
    @InjectWorkspaceScopedRepository(AgentMessageEntity)
    private readonly messageRepository: WorkspaceScopedRepository<AgentMessageEntity>,
    @InjectWorkspaceScopedRepository(AgentMessagePartEntity)
    private readonly messagePartRepository: WorkspaceScopedRepository<AgentMessagePartEntity>,
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
    private readonly titleGenerationService: AgentTitleGenerationService,
    private readonly workspaceEventBroadcaster: WorkspaceEventBroadcaster,
    private readonly codeInterpreterService: CodeInterpreterService,
  ) {}

  async createThread({
    userWorkspaceId,
    workspaceId,
  }: {
    userWorkspaceId: string;
    workspaceId: string;
  }) {
    const savedThread = await this.threadRepository.save(workspaceId, {
      userWorkspaceId,
    });

    await this.workspaceEventBroadcaster.broadcast({
      workspaceId,
      events: [
        {
          type: 'created',
          entityName: 'agentChatThread',
          recordId: savedThread.id,
          recipientUserWorkspaceIds: [userWorkspaceId],
          properties: {
            after: serializeThreadForBroadcast(savedThread, null),
          },
        },
      ],
    });

    return savedThread;
  }

  async getThreadById({
    threadId,
    userWorkspaceId,
    workspaceId,
  }: {
    threadId: string;
    userWorkspaceId: string;
    workspaceId: string;
  }) {
    const thread = await this.threadRepository.findOne(workspaceId, {
      where: {
        id: threadId,
        userWorkspaceId,
      },
    });

    if (!thread) {
      throw new AiException(
        'Thread not found',
        AiExceptionCode.THREAD_NOT_FOUND,
      );
    }

    return thread;
  }

  async getThreadsForUser({
    userWorkspaceId,
    workspaceId,
  }: {
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<(AgentChatThreadEntity & { lastMessageAt: Date | null })[]> {
    // Query builder uses the scoped wrapper's escape hatch; we add the
    // workspaceId predicate manually below.
    const rankedThreads = await this.threadRepository
      .createQueryBuilder('thread')
      .select('thread.id', 'id')
      .addSelect('MAX(message.createdAt)', 'last_message_at')
      .leftJoin('thread.messages', 'message')
      .where(
        'thread.userWorkspaceId = :userWorkspaceId AND thread.workspaceId = :workspaceId',
        { userWorkspaceId, workspaceId },
      )
      .groupBy('thread.id')
      .orderBy('last_message_at', 'DESC', 'NULLS LAST')
      .addOrderBy('thread.updatedAt', 'DESC')
      .getRawMany<{ id: string; last_message_at: Date | null }>();

    if (rankedThreads.length === 0) {
      return [];
    }

    const rankedThreadIds = rankedThreads.map(
      (rankedThread) => rankedThread.id,
    );

    const threads = await this.threadRepository.find(workspaceId, {
      where: { id: In(rankedThreadIds), userWorkspaceId },
    });

    const threadById = new Map(threads.map((thread) => [thread.id, thread]));

    return rankedThreads.flatMap((rankedThread) => {
      const thread = threadById.get(rankedThread.id);

      return thread
        ? [{ ...thread, lastMessageAt: rankedThread.last_message_at ?? null }]
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
    const result = await this.messageRepository
      .createQueryBuilder('message')
      .select('MAX(message.createdAt)', 'last_message_at')
      .where(
        'message.threadId = :threadId AND message.workspaceId = :workspaceId',
        { threadId, workspaceId },
      )
      .getRawOne<{ last_message_at: Date | null }>();

    return result?.last_message_at ?? null;
  }

  async addMessage({
    threadId,
    uiMessage,
    agentId,
    turnId,
    id,
    workspaceId,
  }: {
    threadId: string;
    uiMessage: Omit<ExtendedUIMessage, 'id'>;
    uiMessageParts?: UIMessagePart<UIDataTypes, UITools>[];
    agentId?: string;
    turnId?: string;
    id?: string;
    workspaceId: string;
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
      processedAt: new Date(),
    };

    const insertResult = await this.messageRepository.insert(
      workspaceId,
      messageValues,
    );

    const savedMessageId = (id ?? insertResult.identifiers[0].id) as string;

    if (uiMessage.parts && uiMessage.parts.length > 0) {
      const dbParts = mapUIMessagePartsToDBParts(
        finalizeDanglingToolParts(uiMessage.parts),
        savedMessageId,
        workspaceId,
      );

      if (dbParts.length > 0) {
        await this.messagePartRepository.insert(
          workspaceId,
          dbParts as QueryDeepPartialEntity<AgentMessagePartEntity>[],
        );
      }
    }

    return {
      id: savedMessageId,
      threadId,
      turnId: actualTurnId,
      role: uiMessage.role as AgentMessageRole,
      agentId: agentId ?? null,
      processedAt: new Date(),
      workspaceId,
    } as AgentMessageEntity;
  }

  async getMessagesForThread({
    threadId,
    userWorkspaceId,
    workspaceId,
  }: {
    threadId: string;
    userWorkspaceId: string;
    workspaceId: string;
  }) {
    // getThreadById enforces ownership; messages then scoped by both
    // threadId and workspaceId.
    await this.getThreadById({ threadId, userWorkspaceId, workspaceId });

    return this.messageRepository.find(workspaceId, {
      where: { threadId },
      order: { processedAt: { direction: 'ASC', nulls: 'LAST' } },
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
  }: {
    threadId: string;
    text: string;
    id?: string;
    fileAttachments?: AiChatFileAttachment[];
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<AgentMessageEntity> {
    const messageValues = {
      ...(id ? { id } : {}),
      threadId,
      turnId: null,
      role: AgentMessageRole.USER,
      agentId: null,
      status: AgentMessageStatus.QUEUED,
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
      userWorkspaceId,
      workspaceId,
    });

    return {
      id: savedMessageId,
      ...messageValues,
      workspaceId,
    } as AgentMessageEntity;
  }

  async getQueuedMessages({
    threadId,
    workspaceId,
  }: {
    threadId: string;
    workspaceId: string;
  }): Promise<AgentMessageEntity[]> {
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
  }): Promise<AgentMessageEntity | null> {
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
        processedAt: new Date(),
        turnId: savedTurnId,
      },
    );

    if ((result.affected ?? 0) === 0) {
      await this.turnRepository.delete(workspaceId, { id: savedTurnId });

      return null;
    }

    return savedTurnId;
  }

  async updateThreadTitle({
    threadId,
    userWorkspaceId,
    workspaceId,
    title,
  }: {
    threadId: string;
    userWorkspaceId: string;
    workspaceId: string;
    title: string;
  }): Promise<AgentChatThreadEntity> {
    const trimmed = title.trim();

    if (trimmed.length === 0) {
      throw new AiException(
        'Chat thread title cannot be empty',
        AiExceptionCode.INVALID_CHAT_THREAD_TITLE,
      );
    }

    const result = await this.threadRepository.update(
      workspaceId,
      { id: threadId, userWorkspaceId },
      { title: trimmed },
    );

    if (result.affected === 0) {
      throw new AiException(
        'Thread not found',
        AiExceptionCode.THREAD_NOT_FOUND,
      );
    }

    const updated = await this.getThreadById({
      threadId,
      userWorkspaceId,
      workspaceId,
    });

    await this.broadcastThreadUpdated(updated, ['title'], userWorkspaceId);

    return updated;
  }

  async archiveThread({
    threadId,
    userWorkspaceId,
    workspaceId,
  }: {
    threadId: string;
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<AgentChatThreadEntity> {
    const thread = await this.getThreadById({
      threadId,
      userWorkspaceId,
      workspaceId,
    });

    if (thread.deletedAt) {
      return thread;
    }

    const deletedAt = new Date();

    const result = await this.threadRepository.update(
      workspaceId,
      { id: threadId, userWorkspaceId, deletedAt: IsNull() },
      { deletedAt, activeStreamId: null },
    );

    if ((result.affected ?? 0) === 0) {
      return thread;
    }

    thread.deletedAt = deletedAt;
    thread.activeStreamId = null;

    await this.broadcastThreadUpdated(thread, ['deletedAt'], userWorkspaceId);

    // Best-effort: reclaim the conversation's warm sandbox now; the age sweep is the backstop.
    void this.codeInterpreterService
      .releaseThreadSandbox(workspaceId, threadId)
      .catch((error) =>
        this.logger.warn(
          `Failed to release code interpreter sandbox for thread ${threadId}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        ),
      );

    return thread;
  }

  async unarchiveThread({
    threadId,
    userWorkspaceId,
    workspaceId,
  }: {
    threadId: string;
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<AgentChatThreadEntity> {
    const thread = await this.getThreadById({
      threadId,
      userWorkspaceId,
      workspaceId,
    });

    if (!thread.deletedAt) {
      return thread;
    }

    const result = await this.threadRepository.update(
      workspaceId,
      { id: threadId, userWorkspaceId, deletedAt: Not(IsNull()) },
      { deletedAt: null },
    );

    if ((result.affected ?? 0) === 0) {
      return thread;
    }

    thread.deletedAt = null;

    await this.broadcastThreadUpdated(thread, ['deletedAt'], userWorkspaceId);

    return thread;
  }

  async hardDeleteThread({
    threadId,
    userWorkspaceId,
    workspaceId,
  }: {
    threadId: string;
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<void> {
    const thread = await this.threadRepository.findOne(workspaceId, {
      where: { id: threadId, userWorkspaceId },
    });

    if (!thread) {
      throw new AiException(
        'Thread not found',
        AiExceptionCode.THREAD_NOT_FOUND,
      );
    }

    const result = await this.threadRepository.delete(workspaceId, {
      id: threadId,
      userWorkspaceId,
    });

    if ((result.affected ?? 0) === 0) {
      this.logger.warn(
        `hardDeleteThread: thread ${threadId} vanished between fetch and delete`,
      );

      return;
    }

    await this.workspaceEventBroadcaster.broadcast({
      workspaceId: thread.workspaceId,
      events: [
        {
          type: 'deleted',
          entityName: 'agentChatThread',
          recordId: threadId,
          recipientUserWorkspaceIds: [userWorkspaceId],
          properties: {
            before: serializeThreadForBroadcast(thread, null),
          },
        },
      ],
    });
  }

  async notifyThreadActivityUpdated({
    threadId,
    userWorkspaceId,
    workspaceId,
  }: {
    threadId: string;
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<void> {
    const thread = await this.getThreadById({
      threadId,
      userWorkspaceId,
      workspaceId,
    });

    await this.broadcastThreadUpdated(
      thread,
      ['lastMessageAt'],
      userWorkspaceId,
    );
  }

  async notifyThreadUsageUpdated({
    threadId,
    userWorkspaceId,
    workspaceId,
  }: {
    threadId: string;
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<void> {
    const thread = await this.getThreadById({
      threadId,
      userWorkspaceId,
      workspaceId,
    });

    await this.broadcastThreadUpdated(
      thread,
      [
        'totalInputTokens',
        'totalOutputTokens',
        'totalInputCredits',
        'totalOutputCredits',
        'conversationSize',
        'contextWindowTokens',
      ],
      userWorkspaceId,
    );
  }

  private async broadcastThreadUpdated(
    thread: AgentChatThreadEntity,
    updatedFields: (keyof AgentChatThreadDTO)[],
    userWorkspaceId: string,
  ): Promise<void> {
    const lastMessageAt = await this.getLastMessageAtForThread({
      threadId: thread.id,
      workspaceId: thread.workspaceId,
    });

    await this.workspaceEventBroadcaster.broadcast({
      workspaceId: thread.workspaceId,
      events: [
        {
          type: 'updated',
          entityName: 'agentChatThread',
          recordId: thread.id,
          recipientUserWorkspaceIds: [userWorkspaceId],
          properties: {
            updatedFields,
            after: serializeThreadForBroadcast(thread, lastMessageAt),
          },
        },
      ],
    });
  }

  async generateTitleIfNeeded({
    threadId,
    messageContent,
    workspaceId,
  }: {
    threadId: string;
    messageContent: string;
    workspaceId: string;
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
      thread.userWorkspaceId,
    );

    await this.threadRepository.update(
      workspaceId,
      { id: threadId },
      { title },
    );

    await this.broadcastThreadUpdated(
      { ...thread, title },
      ['title'],
      thread.userWorkspaceId,
    );

    return title;
  }
}
