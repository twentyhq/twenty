import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { type FindOptionsWhere, LessThan, Repository } from 'typeorm';

import type { UIDataTypes, UIMessagePart, UITools } from 'ai';

import { AgentMessagePartEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message-part.entity';
import {
  AgentMessageEntity,
  AgentMessageRole,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { AgentTurnEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-turn.entity';
import { mapUIMessagePartsToDBParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/mapUIMessagePartsToDBParts';
import {
  AgentException,
  AgentExceptionCode,
} from 'src/engine/metadata-modules/ai/ai-agent/agent.exception';
import type { ChatThreadsQueryResult } from 'src/engine/metadata-modules/ai/ai-chat/dtos/chat-threads-query-result.dto';
import { ChatThreadsQueryInput } from 'src/engine/metadata-modules/ai/ai-chat/dtos/chat-threads-query.input';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import {
  decodeCursor,
  encodeCursorData,
} from 'src/engine/api/graphql/graphql-query-runner/utils/cursors.util';

import { AgentTitleGenerationService } from './agent-title-generation.service';

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
    private readonly titleGenerationService: AgentTitleGenerationService,
  ) {}

  async createThread(userWorkspaceId: string) {
    const thread = this.threadRepository.create({
      userWorkspaceId,
    });

    return this.threadRepository.save(thread);
  }

  async getThreadsForUser(
    userWorkspaceId: string,
    input?: ChatThreadsQueryInput,
  ): Promise<ChatThreadsQueryResult> {
    const first = Math.min(input?.first ?? 20, 100);
    const take = first + 1;

    const where: FindOptionsWhere<AgentChatThreadEntity> = {
      userWorkspaceId,
    };

    if (isDefined(input?.after)) {
      const { createdAt: cursorMs } = decodeCursor<{ createdAt: number }>(
        input.after,
      );

      where.createdAt = LessThan(new Date(cursorMs));
    }

    const threads = await this.threadRepository.find({
      where,
      order: { createdAt: 'DESC' },
      take,
    });

    const hasNextPage = threads.length > first;
    const pageThreads = hasNextPage ? threads.slice(0, first) : threads;
    const lastThread = pageThreads[pageThreads.length - 1];
    const endCursor =
      hasNextPage && lastThread
        ? encodeCursorData({
            createdAt: lastThread.createdAt.getTime(),
          })
        : undefined;

    return {
      threads: pageThreads,
      pageInfo: {
        endCursor,
        hasNextPage,
      },
    };
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
  }: {
    threadId: string;
    uiMessage: Omit<ExtendedUIMessage, 'id'>;
    uiMessageParts?: UIMessagePart<UIDataTypes, UITools>[];
    agentId?: string;
    turnId?: string;
  }) {
    let actualTurnId = turnId;

    if (!actualTurnId) {
      const turn = this.turnRepository.create({
        threadId,
        agentId: agentId ?? null,
      });

      const savedTurn = await this.turnRepository.save(turn);

      actualTurnId = savedTurn.id;
    }

    const message = this.messageRepository.create({
      threadId,
      turnId: actualTurnId,
      role: uiMessage.role as AgentMessageRole,
      agentId: agentId ?? null,
    });

    const savedMessage = await this.messageRepository.save(message);

    if (uiMessage.parts && uiMessage.parts.length > 0) {
      const dbParts = mapUIMessagePartsToDBParts(
        uiMessage.parts,
        savedMessage.id,
      );

      await this.messagePartRepository.save(dbParts);
    }

    return savedMessage;
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
      order: { createdAt: 'ASC' },
      relations: ['parts'],
    });
  }

  async generateTitleIfNeeded(
    threadId: string,
    messageContent: string,
  ): Promise<string | null> {
    const thread = await this.threadRepository.findOne({
      where: { id: threadId },
      select: ['id', 'title'],
    });

    if (!thread || thread.title || !messageContent) {
      return null;
    }

    const title =
      await this.titleGenerationService.generateThreadTitle(messageContent);

    await this.threadRepository.update(threadId, { title });

    return title;
  }
}
