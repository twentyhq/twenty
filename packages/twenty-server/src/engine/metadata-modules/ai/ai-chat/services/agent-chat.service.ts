import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ExtendedUIMessage } from 'twenty-shared/ai';
import { In, Repository } from 'typeorm';
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
import {
  AgentException,
  AgentExceptionCode,
} from 'src/engine/metadata-modules/ai/ai-agent/agent.exception';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { WorkspaceEventBroadcaster } from 'src/engine/subscriptions/workspace-event-broadcaster/workspace-event-broadcaster.service';

import { AgentTitleGenerationService } from './agent-title-generation.service';

const serializeThreadForBroadcast = (thread: AgentChatThreadEntity) => ({
  id: thread.id,
  title: thread.title,
  totalInputTokens: thread.totalInputTokens,
  totalOutputTokens: thread.totalOutputTokens,
  contextWindowTokens: thread.contextWindowTokens,
  conversationSize: thread.conversationSize,
  totalInputCredits: thread.totalInputCredits,
  totalOutputCredits: thread.totalOutputCredits,
  createdAt: thread.createdAt.toISOString(),
  updatedAt: thread.updatedAt.toISOString(),
});

@Injectable()
export class AgentChatService {
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
          properties: {
            after: serializeThreadForBroadcast(savedThread),
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
      throw new AgentException(
        'Thread not found',
        AgentExceptionCode.AGENT_EXECUTION_FAILED,
      );
    }

    return thread;
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
      throw new AgentException(
        'Thread not found',
        AgentExceptionCode.AGENT_EXECUTION_FAILED,
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
  }: {
    threadId: string;
    text: string;
    id?: string;
    fileIds?: string[];
    workspaceId: string;
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

    const title =
      await this.titleGenerationService.generateThreadTitle(messageContent);

    await this.threadRepository.update(threadId, { title });

    await this.workspaceEventBroadcaster.broadcast({
      workspaceId,
      events: [
        {
          type: 'updated',
          entityName: 'agentChatThread',
          recordId: threadId,
          properties: {
            updatedFields: ['title'],
            after: serializeThreadForBroadcast({ ...thread, title }),
          },
        },
      ],
    });

    return title;
  }
}
