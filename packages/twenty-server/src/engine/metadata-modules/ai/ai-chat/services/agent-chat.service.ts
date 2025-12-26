import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ExtendedUIMessage } from 'twenty-shared/ai';
import { Repository } from 'typeorm';

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
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';

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

  async getThreadsForUser(userWorkspaceId: string) {
    return this.threadRepository.find({
      where: {
        userWorkspaceId,
      },
      order: { createdAt: 'DESC' },
    });
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

    if (uiMessage.role === AgentMessageRole.USER) {
      const messageContent = uiMessage.parts.find(
        (part) => part.type === 'text',
      )?.text;

      if (messageContent) {
        this.generateTitleIfNeeded(threadId, messageContent);
      }
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

  private async generateTitleIfNeeded(
    threadId: string,
    messageContent: string,
  ) {
    const thread = await this.threadRepository.findOne({
      where: { id: threadId },
      select: ['id', 'title'],
    });

    if (!thread || thread.title || !messageContent) {
      return;
    }

    const title =
      await this.titleGenerationService.generateThreadTitle(messageContent);

    await this.threadRepository.update(threadId, { title });
  }
}
