import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type Response } from 'express';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { type Repository } from 'typeorm';

import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  AgentException,
  AgentExceptionCode,
} from 'src/engine/metadata-modules/ai/ai-agent/agent.exception';
import { type RecordIdsByObjectMetadataNameSingularType } from 'src/engine/metadata-modules/ai/ai-agent/types/recordIdsByObjectMetadataNameSingular.type';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { AgentChatRoutingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-routing.service';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';

export type StreamAgentChatOptions = {
  threadId: string;
  userWorkspaceId: string;
  workspace: WorkspaceEntity;
  recordIdsByObjectMetadataNameSingular: RecordIdsByObjectMetadataNameSingularType;
  response: Response;
  messages: ExtendedUIMessage[];
};

@Injectable()
export class AgentChatStreamingService {
  constructor(
    @InjectRepository(AgentChatThreadEntity)
    private readonly threadRepository: Repository<AgentChatThreadEntity>,
    private readonly agentChatService: AgentChatService,
    private readonly agentChatRoutingService: AgentChatRoutingService,
  ) {}

  async streamAgentChat({
    threadId,
    userWorkspaceId,
    workspace,
    messages,
    recordIdsByObjectMetadataNameSingular,
    response,
  }: StreamAgentChatOptions) {
    const thread = await this.threadRepository.findOne({
      where: {
        id: threadId,
        userWorkspaceId,
      },
      relations: ['messages'],
    });

    if (!thread) {
      throw new AgentException(
        'Thread not found',
        AgentExceptionCode.AGENT_EXECUTION_FAILED,
      );
    }

    await this.agentChatRoutingService.streamAgentExecution({
      userWorkspaceId,
      workspace,
      messages,
      recordIdsByObjectMetadataNameSingular,
      response,
      persistenceCallbacks: {
        saveSystemMessage: async (message) => {
          const savedMessage = await this.agentChatService.addMessage({
            threadId,
            uiMessage: message,
          });

          return { turnId: savedMessage.turnId };
        },
        saveUserMessage: async (message, turnId) => {
          const savedMessage = await this.agentChatService.addMessage({
            threadId,
            uiMessage: message,
            turnId,
          });

          return { turnId: savedMessage.turnId };
        },
        saveAssistantMessage: async (message, turnId, agentId) => {
          await this.agentChatService.addMessage({
            threadId,
            uiMessage: message,
            agentId,
            turnId,
          });
        },
      },
    });
  }
}
