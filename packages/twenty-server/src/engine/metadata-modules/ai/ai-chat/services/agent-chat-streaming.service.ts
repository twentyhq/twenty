import { Injectable } from '@nestjs/common';
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
import { computeCostBreakdown } from 'src/engine/metadata-modules/ai/ai-billing/utils/compute-cost-breakdown.util';
import { convertDollarsToBillingCredits } from 'src/engine/metadata-modules/ai/ai-billing/utils/convert-dollars-to-billing-credits.util';
import { extractCacheCreationTokens } from 'src/engine/metadata-modules/ai/ai-billing/utils/extract-cache-creation-tokens.util';
import { toDisplayCredits } from 'src/engine/core-modules/billing/utils/to-display-credits.util';
import { type AIModelConfig } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-models-types.const';
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

    // Fire user-message save without awaiting to avoid delaying time-to-first-letter.
    // The promise is awaited inside onFinish where we need the turnId.
    const lastUserText =
      messages[messages.length - 1]?.parts.find((part) => part.type === 'text')
        ?.text ?? '';

    const userMessagePromise = this.agentChatService.addMessage({
      threadId: thread.id,
      uiMessage: {
        role: AgentMessageRole.USER,
        parts: [{ type: 'text', text: lastUserText }],
      },
    });

    // Prevent unhandled rejection if onFinish never runs (e.g. stream
    // setup error or empty response early-return). The real error still
    // surfaces when awaited in onFinish.
    userMessagePromise.catch(() => {});

    // Title generation runs in parallel with AI streaming so it's
    // typically ready by the time onFinish fires
    const titlePromise = thread.title
      ? Promise.resolve(null)
      : this.agentChatService
          .generateTitleIfNeeded(thread.id, lastUserText)
          .catch(() => null);

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
                return error instanceof Error ? error.message : String(error);
              },
              sendStart: false,
              messageMetadata: ({ part }) => {
                if (part.type === 'finish-step') {
                  const stepInput = part.usage?.inputTokens ?? 0;
                  const stepCached =
                    part.usage?.inputTokenDetails?.cacheReadTokens ?? 0;
                  const stepCacheCreation = extractCacheCreationTokens(
                    (
                      part as {
                        providerMetadata?: Record<
                          string,
                          Record<string, unknown> | undefined
                        >;
                      }
                    ).providerMetadata,
                  );

                  totalCacheCreationTokens += stepCacheCreation;
                  lastStepConversationSize =
                    stepInput + stepCached + stepCacheCreation;
                }

                if (part.type === 'finish') {
                  const { inputCredits, outputCredits, tokenCounts } =
                    computeStreamCosts(
                      modelConfig,
                      part.totalUsage,
                      totalCacheCreationTokens,
                    );

                  streamUsage = {
                    inputTokens: tokenCounts.totalInputTokens,
                    outputTokens: tokenCounts.outputTokens,
                    inputCredits,
                    outputCredits,
                  };

                  return {
                    createdAt: new Date().toISOString(),
                    usage: {
                      inputTokens: tokenCounts.totalInputTokens,
                      outputTokens: tokenCounts.outputTokens,
                      cachedInputTokens: tokenCounts.cachedInputTokens,
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

                const userMessage = await userMessagePromise;

                await this.agentChatService.addMessage({
                  threadId: thread.id,
                  uiMessage: responseMessage,
                  turnId: userMessage.turnId,
                });

                await this.threadRepository.update(thread.id, {
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

                const generatedTitle = await titlePromise;

                if (generatedTitle) {
                  writer.write({
                    type: 'data-thread-title' as const,
                    id: `thread-title-${thread.id}`,
                    data: { title: generatedTitle },
                  });
                }
              },
              sendReasoning: true,
            }),
          );
        },
      });

      pipeUIMessageStreamToResponse({
        stream: uiStream,
        response,
        // Consume the stream independently so onFinish fires even if
        // the client disconnects (e.g., page refresh mid-stream)
        consumeSseStream: ({ stream }) => {
          stream.pipeTo(new WritableStream()).catch(() => {});
        },
      });
    } catch (error) {
      response.end();
      throw error;
    }
  }
}

function computeStreamCosts(
  modelConfig: AIModelConfig,
  totalUsage:
    | {
        inputTokens?: number;
        outputTokens?: number;
        inputTokenDetails?: { cacheReadTokens?: number };
        outputTokenDetails?: { reasoningTokens?: number };
      }
    | undefined,
  cacheCreationTokens: number,
) {
  const breakdown = computeCostBreakdown(modelConfig, {
    inputTokens: totalUsage?.inputTokens,
    outputTokens: totalUsage?.outputTokens,
    cachedInputTokens: totalUsage?.inputTokenDetails?.cacheReadTokens,
    reasoningTokens: totalUsage?.outputTokenDetails?.reasoningTokens,
    cacheCreationTokens,
  });

  return {
    inputCredits: Math.round(
      convertDollarsToBillingCredits(breakdown.inputCostInDollars),
    ),
    outputCredits: Math.round(
      convertDollarsToBillingCredits(breakdown.outputCostInDollars),
    ),
    tokenCounts: {
      totalInputTokens: breakdown.tokenCounts.totalInputTokens,
      outputTokens: totalUsage?.outputTokens ?? 0,
      cachedInputTokens: breakdown.tokenCounts.cachedInputTokens,
    },
  };
}
