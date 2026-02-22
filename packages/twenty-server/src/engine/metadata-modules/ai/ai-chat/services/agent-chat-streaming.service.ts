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
import { convertDollarsToBillingCredits } from 'src/engine/metadata-modules/ai/ai-billing/utils/convert-dollars-to-billing-credits.util';
import { toDisplayCredits } from 'src/engine/core-modules/billing/utils/to-display-credits.util';
import {
  type AIModelConfig,
  ModelFamily,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-models-types.const';
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
                  const stepCached = part.usage?.cachedInputTokens ?? 0;

                  // Anthropic/Bedrock exclude cached/created tokens from
                  // input_tokens, reporting them separately
                  const providerMeta = (
                    part as {
                      providerMetadata?: {
                        anthropic?: {
                          usage?: { cache_creation_input_tokens?: number };
                        };
                        bedrock?: {
                          usage?: { cacheWriteInputTokens?: number };
                        };
                      };
                    }
                  ).providerMetadata;
                  const stepCacheCreation =
                    providerMeta?.anthropic?.usage
                      ?.cache_creation_input_tokens ??
                    providerMeta?.bedrock?.usage?.cacheWriteInputTokens ??
                    0;

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
        cachedInputTokens?: number;
        reasoningTokens?: number;
      }
    | undefined,
  cacheCreationTokens: number,
) {
  const rawInputTokens = totalUsage?.inputTokens ?? 0;
  const rawOutputTokens = totalUsage?.outputTokens ?? 0;
  const cachedInputTokens = totalUsage?.cachedInputTokens ?? 0;
  const reasoningTokens = totalUsage?.reasoningTokens ?? 0;

  const isAnthropicFamily = modelConfig.modelFamily === ModelFamily.ANTHROPIC;

  const adjustedInputTokens = isAnthropicFamily
    ? rawInputTokens
    : rawInputTokens - cachedInputTokens;

  // Anthropic: outputTokens excludes reasoning; others include them
  const adjustedOutputTokens = isAnthropicFamily
    ? rawOutputTokens
    : rawOutputTokens - reasoningTokens;

  const totalInputTokens = isAnthropicFamily
    ? rawInputTokens + cachedInputTokens + cacheCreationTokens
    : rawInputTokens + cacheCreationTokens;

  const costInfo =
    modelConfig.longContextCost &&
    totalInputTokens > modelConfig.longContextCost.thresholdTokens
      ? modelConfig.longContextCost
      : modelConfig;

  const inputRate = costInfo.inputCostPerMillionTokens;
  const outputRate = costInfo.outputCostPerMillionTokens;
  const cachedRate = costInfo.cachedInputCostPerMillionTokens ?? inputRate;
  const cacheCreationRate =
    costInfo.cacheCreationCostPerMillionTokens ?? inputRate;

  const inputCostInDollars =
    (adjustedInputTokens / 1_000_000) * inputRate +
    (cachedInputTokens / 1_000_000) * cachedRate +
    (cacheCreationTokens / 1_000_000) * cacheCreationRate;

  const outputCostInDollars =
    (adjustedOutputTokens / 1_000_000) * outputRate +
    (reasoningTokens / 1_000_000) * outputRate;

  return {
    inputCredits: Math.round(
      convertDollarsToBillingCredits(inputCostInDollars),
    ),
    outputCredits: Math.round(
      convertDollarsToBillingCredits(outputCostInDollars),
    ),
    tokenCounts: {
      totalInputTokens,
      outputTokens: rawOutputTokens,
      cachedInputTokens,
    },
  };
}
