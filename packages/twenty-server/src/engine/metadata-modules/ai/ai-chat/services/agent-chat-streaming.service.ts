import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { createUIMessageStream, pipeUIMessageStreamToResponse } from 'ai';
import { type Response } from 'express';
import {
  type CodeExecutionData,
  type ExtendedUIMessage,
} from 'twenty-shared/ai';
import { type Repository } from 'typeorm';

import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import {
  AgentException,
  AgentExceptionCode,
} from 'src/engine/metadata-modules/ai/ai-agent/agent.exception';
import { type BrowsingContextType } from 'src/engine/metadata-modules/ai/ai-agent/types/browsingContext.type';
import { convertCentsToBillingCredits } from 'src/engine/metadata-modules/ai/ai-billing/utils/convert-cents-to-billing-credits.util';
import { toDisplayCredits } from 'src/engine/core-modules/billing/utils/to-display-credits.util';
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
          const onCodeExecutionUpdate = (data: CodeExecutionData) => {
            writer.write({
              type: 'data-code-execution' as const,
              id: `code-execution-${data.executionId}`,
              data,
            });
          };

          const { stream, modelConfig } =
            await this.chatExecutionService.streamChat({
              workspace,
              userWorkspaceId,
              messages,
              browsingContext,
              onCodeExecutionUpdate,
            });

          let streamUsage = {
            inputTokens: 0,
            outputTokens: 0,
            inputCredits: 0,
            outputCredits: 0,
          };
          let lastStepConversationSize = 0;
          let totalCacheCreationTokens = 0;

          writer.merge(
            stream.toUIMessageStream({
              onError: (error) => {
                this.logger.error('Stream error:', error);

                return error instanceof Error ? error.message : String(error);
              },
              sendStart: false,
              messageMetadata: ({ part }) => {
                if (part.type === 'finish-step') {
                  const stepInput = part.usage?.inputTokens ?? 0;
                  const stepCached = part.usage?.cachedInputTokens ?? 0;

                  // Anthropic excludes cached/created tokens from input_tokens,
                  // reporting them separately as cache_creation_input_tokens
                  const anthropicUsage = (
                    part as {
                      providerMetadata?: {
                        anthropic?: {
                          usage?: { cache_creation_input_tokens?: number };
                        };
                      };
                    }
                  ).providerMetadata?.anthropic?.usage;
                  const stepCacheCreation =
                    anthropicUsage?.cache_creation_input_tokens ?? 0;

                  totalCacheCreationTokens += stepCacheCreation;
                  lastStepConversationSize =
                    stepInput + stepCached + stepCacheCreation;
                }

                if (part.type === 'finish') {
                  const inputTokens =
                    (part.totalUsage?.inputTokens ?? 0) +
                    (part.totalUsage?.cachedInputTokens ?? 0) +
                    totalCacheCreationTokens;
                  const outputTokens = part.totalUsage?.outputTokens ?? 0;
                  const cachedInputTokens =
                    part.totalUsage?.cachedInputTokens ?? 0;

                  const inputCostInCents =
                    (inputTokens / 1000) *
                    modelConfig.inputCostPer1kTokensInCents;
                  const outputCostInCents =
                    (outputTokens / 1000) *
                    modelConfig.outputCostPer1kTokensInCents;

                  const inputCredits = Math.round(
                    convertCentsToBillingCredits(inputCostInCents),
                  );
                  const outputCredits = Math.round(
                    convertCentsToBillingCredits(outputCostInCents),
                  );

                  streamUsage = {
                    inputTokens,
                    outputTokens,
                    inputCredits,
                    outputCredits,
                  };

                  return {
                    createdAt: new Date().toISOString(),
                    usage: {
                      inputTokens,
                      outputTokens,
                      cachedInputTokens,
                      inputCredits: toDisplayCredits(inputCredits),
                      outputCredits: toDisplayCredits(outputCredits),
                      conversationSize: lastStepConversationSize,
                    },
                    model: {
                      contextWindowTokens: modelConfig.contextWindowTokens,
                    },
                  };
                }

                return undefined;
              },
              onFinish: async ({ responseMessage }) => {
                if (responseMessage.parts.length === 0) {
                  return;
                }

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

                  await this.threadRepository.update(validThreadId, {
                    totalInputTokens: () =>
                      `"totalInputTokens" + ${streamUsage.inputTokens}`,
                    totalOutputTokens: () =>
                      `"totalOutputTokens" + ${streamUsage.outputTokens}`,
                    totalInputCredits: () =>
                      `"totalInputCredits" + ${streamUsage.inputCredits}`,
                    totalOutputCredits: () =>
                      `"totalOutputCredits" + ${streamUsage.outputCredits}`,
                    contextWindowTokens: modelConfig.contextWindowTokens,
                    conversationSize: lastStepConversationSize,
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
