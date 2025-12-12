import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { createUIMessageStream, pipeUIMessageStreamToResponse } from 'ai';
import { type Response } from 'express';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { type Repository } from 'typeorm';

import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import {
  AgentException,
  AgentExceptionCode,
} from 'src/engine/metadata-modules/ai/ai-agent/agent.exception';
import { type BrowsingContextType } from 'src/engine/metadata-modules/ai/ai-agent/types/browsingContext.type';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';

import { AgentChatService } from './agent-chat.service';
import { ChatExecutionService } from './chat-execution.service';

export type StreamAgentChatOptions = {
  threadId: string;
  userWorkspaceId: string;
  workspace: WorkspaceEntity;
  response: Response;
  messages: ExtendedUIMessage[];
  browsingContext: BrowsingContextType | null;
};

@Injectable()
export class AgentChatStreamingService {
  private readonly logger = new Logger(AgentChatStreamingService.name);

  constructor(
    @InjectRepository(AgentChatThreadEntity)
    private readonly threadRepository: Repository<AgentChatThreadEntity>,
    private readonly agentChatService: AgentChatService,
    private readonly chatExecutionService: ChatExecutionService,
  ) {}

  async streamAgentChat({
    threadId,
    userWorkspaceId,
    workspace,
    messages,
    browsingContext,
    response,
  }: StreamAgentChatOptions) {
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

    try {
      const uiStream = createUIMessageStream<ExtendedUIMessage>({
        execute: async ({ writer }) => {
          const { stream, modelConfig } =
            await this.chatExecutionService.streamChat({
              workspace,
              userWorkspaceId,
              messages,
              browsingContext,
            });

          // Write initial status
          writer.write({
            type: 'data-routing-status' as const,
            id: 'execution-status',
            data: {
              text: 'Processing your request...',
              state: 'loading',
            },
          });

          // Merge the AI stream
          writer.merge(
            stream.toUIMessageStream({
              onError: (error) => {
                this.logger.error('Stream error:', error);

                return error instanceof Error ? error.message : String(error);
              },
              sendStart: false,
              messageMetadata: ({ part }) => {
                if (part.type === 'finish') {
                  return {
                    createdAt: new Date().toISOString(),
                    usage: {
                      inputTokens: part.totalUsage?.inputTokens ?? 0,
                      outputTokens: part.totalUsage?.outputTokens ?? 0,
                      totalTokens: part.totalUsage?.totalTokens ?? 0,
                    },
                    model: {
                      modelId: modelConfig.modelId,
                      contextWindowTokens: modelConfig.contextWindowTokens,
                      inputCostPer1kTokens:
                        modelConfig.inputCostPer1kTokensInCents,
                      outputCostPer1kTokens:
                        modelConfig.outputCostPer1kTokensInCents,
                    },
                  };
                }

                return undefined;
              },
              onFinish: async ({ responseMessage }) => {
                if (responseMessage.parts.length === 0) {
                  return;
                }

                // Update status to completed
                writer.write({
                  type: 'data-routing-status' as const,
                  id: 'execution-status',
                  data: {
                    text: 'Completed',
                    state: 'routed',
                  },
                });

                // Save messages to database
                // Use thread.id from the validated thread object to ensure it's not null
                const validThreadId = thread.id;

                if (!validThreadId) {
                  this.logger.error('Thread ID is unexpectedly null/undefined');

                  return;
                }

                try {
                  const userMessage = await this.agentChatService.addMessage({
                    threadId: validThreadId,
                    uiMessage: {
                      role: AgentMessageRole.USER,
                      parts: [
                        {
                          type: 'text',
                          text:
                            messages[messages.length - 1].parts.find(
                              (part) => part.type === 'text',
                            )?.text ?? '',
                        },
                      ],
                    },
                  });

                  await this.agentChatService.addMessage({
                    threadId: validThreadId,
                    uiMessage: responseMessage,
                    turnId: userMessage.turnId,
                  });
                } catch (saveError) {
                  this.logger.error(
                    'Failed to save messages:',
                    saveError instanceof Error
                      ? saveError.message
                      : String(saveError),
                  );
                }
              },
              sendReasoning: true,
            }),
          );
        },
      });

      pipeUIMessageStreamToResponse({ stream: uiStream, response });
    } catch (error) {
      this.logger.error(
        'Failed to stream chat:',
        error instanceof Error ? error.message : String(error),
      );
      response.end();
    }
  }
}
