import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ExtendedUIMessage } from 'twenty-shared/ai';
import { In, IsNull, Not, Repository } from 'typeorm';
import type { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import type { UIDataTypes, UIMessagePart, UITools } from 'ai';

import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { AgentMessagePartEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message-part.entity';
import {
  AgentMessageEntity,
  AgentMessageRole,
  AgentMessageStatus,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { AgentTurnEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-turn.entity';
import { mapUIMessagePartsToDBParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/mapUIMessagePartsToDBParts';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { WorkspaceEventBroadcaster } from 'src/engine/subscriptions/workspace-event-broadcaster/workspace-event-broadcaster.service';

import { AgentTitleGenerationService } from './agent-title-generation.service';

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
  totalInputCredits: thread.totalInputCredits,
  totalOutputCredits: thread.totalOutputCredits,
  deletedAt: thread.deletedAt,
  lastMessageAt,
  createdAt: thread.createdAt,
  updatedAt: thread.updatedAt,
});

@Injectable()
export class AgentChatService {
  private readonly logger = new Logger(AgentChatService.name);

  constructor(
    @InjectRepository(AgentChatThreadEntity)
    private readonly threadRepository: Repository<AgentChatThreadEntity>,
    @InjectRepository(AgentTurnEntity)
    private readonly turnRepository: Repository<AgentTurnEntity>,
    @InjectRepository(AgentMessageEntity)
    private readonly messageRepository: Repository<AgentMessageEntity>,
    @InjectRepository(AgentMessagePartEntity)
    private readonly messagePartRepository: Repository<AgentMessagePartEntity>,
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    private readonly titleGenerationService: AgentTitleGenerationService,
    private readonly workspaceEventBroadcaster: WorkspaceEventBroadcaster,
  ) {}

  async createThread({
    userWorkspaceId,
    workspaceId,
  }: {
    userWorkspaceId: string;
    workspaceId: string;
  }) {
    const thread = this.threadRepository.create({
      userWorkspaceId,
      workspaceId,
    });

    const savedThread = await this.threadRepository.save(thread);

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

  async getThreadById(threadId: string, userWorkspaceId: string) {
    const thread = await this.threadRepository.findOne({
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

  async getThreadsForUser(
    userWorkspaceId: string,
  ): Promise<(AgentChatThreadEntity & { lastMessageAt: Date | null })[]> {
    const rankedThreads = await this.threadRepository
      .createQueryBuilder('thread')
      .select('thread.id', 'id')
      .addSelect('MAX(message.createdAt)', 'last_message_at')
      .leftJoin('thread.messages', 'message')
      .where('thread.userWorkspaceId = :userWorkspaceId', { userWorkspaceId })
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

    const threads = await this.threadRepository.find({
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

  async getLastMessageAtForThread(threadId: string): Promise<Date | null> {
    const result = await this.messageRepository
      .createQueryBuilder('message')
      .select('MAX(message.createdAt)', 'last_message_at')
      .where('message.threadId = :threadId', { threadId })
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
      const turnInsertResult = await this.turnRepository.insert({
        threadId,
        agentId: agentId ?? null,
        workspaceId,
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
      workspaceId,
    };

    const insertResult = await this.messageRepository.insert(messageValues);

    const savedMessageId = (id ?? insertResult.identifiers[0].id) as string;

    if (uiMessage.parts && uiMessage.parts.length > 0) {
      const dbParts = mapUIMessagePartsToDBParts(
        uiMessage.parts,
        savedMessageId,
        workspaceId,
      );

      await this.messagePartRepository.insert(
        dbParts as QueryDeepPartialEntity<AgentMessagePartEntity>[],
      );
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

  async getMessagesForThread(threadId: string, userWorkspaceId: string) {
    const thread = await this.threadRepository.findOne({
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

    return this.messageRepository.find({
      where: { threadId },
      order: { processedAt: { direction: 'ASC', nulls: 'LAST' } },
      relations: ['parts', 'parts.file'],
    });
  }

  async queueMessage({
    threadId,
    text,
    id,
    fileIds,
    workspaceId,
    userWorkspaceId,
  }: {
    threadId: string;
    text: string;
    id?: string;
    fileIds?: string[];
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
      workspaceId,
    };

    const insertResult = await this.messageRepository.insert(messageValues);

    const savedMessageId = (id ?? insertResult.identifiers[0].id) as string;

    const files =
      fileIds && fileIds.length > 0
        ? await this.fileRepository.find({
            where: { id: In(fileIds), workspaceId },
          })
        : [];

    const parts = [
      {
        messageId: savedMessageId,
        orderIndex: 0,
        type: 'text',
        textContent: text,
        workspaceId,
      },
      ...files.map((file, index) => ({
        messageId: savedMessageId,
        orderIndex: index + 1,
        type: 'file',
        fileId: file.id,
        fileFilename: file.path.split('/').pop() ?? null,
        workspaceId,
      })),
    ];

    await this.messagePartRepository.insert(parts);

    await this.notifyThreadActivityUpdated(threadId, userWorkspaceId);

    return {
      id: savedMessageId,
      ...messageValues,
    } as AgentMessageEntity;
  }

  async getQueuedMessages(threadId: string): Promise<AgentMessageEntity[]> {
    return this.messageRepository.find({
      where: {
        threadId,
        status: AgentMessageStatus.QUEUED,
      },
      order: { createdAt: 'ASC' },
      relations: ['parts', 'parts.file'],
    });
  }

  async findQueuedMessage(
    messageId: string,
  ): Promise<AgentMessageEntity | null> {
    return this.messageRepository.findOne({
      where: { id: messageId, status: AgentMessageStatus.QUEUED },
    });
  }

  async deleteQueuedMessage(messageId: string): Promise<boolean> {
    const result = await this.messageRepository.delete({
      id: messageId,
      status: AgentMessageStatus.QUEUED,
    });

    return (result.affected ?? 0) > 0;
  }

  async promoteQueuedMessage(
    messageId: string,
    threadId: string,
    workspaceId: string,
  ): Promise<string | null> {
    const turnInsertResult = await this.turnRepository.insert({
      threadId,
      agentId: null,
      workspaceId,
    });

    const savedTurnId = turnInsertResult.identifiers[0].id as string;

    const result = await this.messageRepository.update(
      { id: messageId, threadId, status: AgentMessageStatus.QUEUED },
      {
        status: AgentMessageStatus.SENT,
        processedAt: new Date(),
        turnId: savedTurnId,
      },
    );

    if ((result.affected ?? 0) === 0) {
      await this.turnRepository.delete(savedTurnId);

      return null;
    }

    return savedTurnId;
  }

  async updateThreadTitle({
    threadId,
    userWorkspaceId,
    title,
  }: {
    threadId: string;
    userWorkspaceId: string;
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
      { id: threadId, userWorkspaceId },
      { title: trimmed },
    );

    if (result.affected === 0) {
      throw new AiException(
        'Thread not found',
        AiExceptionCode.THREAD_NOT_FOUND,
      );
    }

    const updated = await this.getThreadById(threadId, userWorkspaceId);

    await this.broadcastThreadUpdated(updated, ['title'], userWorkspaceId);

    return updated;
  }

  async archiveThread({
    threadId,
    userWorkspaceId,
  }: {
    threadId: string;
    userWorkspaceId: string;
  }): Promise<AgentChatThreadEntity> {
    const thread = await this.getThreadById(threadId, userWorkspaceId);

    if (thread.deletedAt) {
      return thread;
    }

    const deletedAt = new Date();

    const result = await this.threadRepository.update(
      { id: threadId, userWorkspaceId, deletedAt: IsNull() },
      { deletedAt, activeStreamId: null },
    );

    if ((result.affected ?? 0) === 0) {
      return thread;
    }

    thread.deletedAt = deletedAt;
    thread.activeStreamId = null;

    await this.broadcastThreadUpdated(thread, ['deletedAt'], userWorkspaceId);

    return thread;
  }

  async unarchiveThread({
    threadId,
    userWorkspaceId,
  }: {
    threadId: string;
    userWorkspaceId: string;
  }): Promise<AgentChatThreadEntity> {
    const thread = await this.getThreadById(threadId, userWorkspaceId);

    if (!thread.deletedAt) {
      return thread;
    }

    const result = await this.threadRepository.update(
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
  }: {
    threadId: string;
    userWorkspaceId: string;
  }): Promise<void> {
    const thread = await this.threadRepository.findOne({
      where: { id: threadId, userWorkspaceId },
    });

    if (!thread) {
      throw new AiException(
        'Thread not found',
        AiExceptionCode.THREAD_NOT_FOUND,
      );
    }

    const result = await this.threadRepository.delete({
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

  async notifyThreadActivityUpdated(
    threadId: string,
    userWorkspaceId: string,
  ): Promise<void> {
    const thread = await this.getThreadById(threadId, userWorkspaceId);

    await this.broadcastThreadUpdated(
      thread,
      ['lastMessageAt'],
      userWorkspaceId,
    );
  }

  private async broadcastThreadUpdated(
    thread: AgentChatThreadEntity,
    updatedFields: string[],
    userWorkspaceId: string,
  ): Promise<void> {
    const lastMessageAt = await this.getLastMessageAtForThread(thread.id);

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
    const thread = await this.threadRepository.findOne({
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

    await this.threadRepository.update(threadId, { title });

    await this.broadcastThreadUpdated(
      { ...thread, title },
      ['title'],
      thread.userWorkspaceId,
    );

    return title;
  }
}
