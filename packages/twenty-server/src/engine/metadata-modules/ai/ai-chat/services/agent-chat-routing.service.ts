import { Injectable, Logger } from '@nestjs/common';

import { createUIMessageStream, pipeUIMessageStreamToResponse } from 'ai';
import { type Response } from 'express';
import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { AgentExecutionService } from 'src/engine/metadata-modules/ai/ai-agent/services/agent-execution.service';
import { AgentPlanExecutorService } from 'src/engine/metadata-modules/ai/ai-agent/services/agent-plan-executor.service';
import { type RecordIdsByObjectMetadataNameSingularType } from 'src/engine/metadata-modules/ai/ai-agent/types/recordIdsByObjectMetadataNameSingular.type';
import { AIBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { convertCentsToBillingCredits } from 'src/engine/metadata-modules/ai/ai-billing/utils/convert-cents-to-billing-credits.util';
import { AiChatRouterService } from 'src/engine/metadata-modules/ai/ai-chat-router/ai-chat-router.service';
import { type ModelId } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-models.const';

export type TokenUsage = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

export type MessagePersistenceCallbacks = {
  saveSystemMessage?: (message: Omit<ExtendedUIMessage, 'id'>) => Promise<{
    turnId: string;
  }>;
  saveUserMessage: (
    message: Omit<ExtendedUIMessage, 'id'>,
    turnId?: string,
  ) => Promise<{ turnId: string }>;
  saveAssistantMessage: (
    message: Omit<ExtendedUIMessage, 'id'>,
    turnId: string,
    agentId: string,
  ) => Promise<void>;
};

export type StreamAgentExecutionOptions = {
  userWorkspaceId: string;
  workspace: WorkspaceEntity;
  recordIdsByObjectMetadataNameSingular: RecordIdsByObjectMetadataNameSingularType;
  response: Response;
  messages: ExtendedUIMessage[];
  persistenceCallbacks: MessagePersistenceCallbacks;
};

@Injectable()
export class AgentChatRoutingService {
  private readonly logger = new Logger(AgentChatRoutingService.name);

  constructor(
    private readonly agentExecutionService: AgentExecutionService,
    private readonly agentPlanExecutorService: AgentPlanExecutorService,
    private readonly aiChatRouterService: AiChatRouterService,
    private readonly aiBillingService: AIBillingService,
  ) {}

  async streamAgentExecution({
    userWorkspaceId,
    workspace,
    messages,
    recordIdsByObjectMetadataNameSingular,
    response,
    persistenceCallbacks,
  }: StreamAgentExecutionOptions) {
    try {
      const stream = createUIMessageStream<ExtendedUIMessage>({
        execute: async ({ writer }) => {
          const startTime = Date.now();

          writer.write({
            type: 'data-routing-status' as const,
            id: 'routing-status',
            data: {
              text: 'Finding the best agent for your request...',
              state: 'loading',
            },
          });

          const routingStart = Date.now();
          const includeDebugInfo = true;
          const routeResult = await this.aiChatRouterService.routeMessage(
            {
              messages,
              workspaceId: workspace.id,
              fastModel: workspace.fastModel,
              smartModel: workspace.smartModel,
            },
            includeDebugInfo,
          );

          const routingTime = Date.now() - routingStart;

          const { debugInfo } = routeResult;

          let routingCostInCredits: number | undefined;

          if (
            debugInfo?.routerModel &&
            debugInfo?.promptTokens !== undefined &&
            debugInfo?.completionTokens !== undefined
          ) {
            try {
              const routingCostInCents =
                await this.aiBillingService.calculateCost(
                  debugInfo.routerModel as ModelId,
                  {
                    inputTokens: debugInfo.promptTokens,
                    outputTokens: debugInfo.completionTokens,
                    totalTokens: debugInfo.totalTokens || 0,
                  },
                );

              routingCostInCredits = Math.round(
                convertCentsToBillingCredits(routingCostInCents),
              );
            } catch (error) {
              this.logger.warn('Failed to calculate routing cost:', error);
            }
          }

          if (routeResult.strategy === 'planned') {
            this.logger.log(
              `Executing planned strategy with ${routeResult.plan.steps.length} steps`,
            );
            this.logger.log(
              `Plan steps: ${routeResult.plan.steps.map((s) => `${s.stepNumber}. ${s.agentName}: ${s.task}`).join('; ')}`,
            );

            writer.write({
              type: 'data-routing-status' as const,
              id: 'routing-status',
              data: {
                text: `Executing ${routeResult.plan.steps.length}-step plan`,
                state: 'routed',
                debug: {
                  routingTimeMs: routingTime,
                  planReasoning: routeResult.plan.reasoning,
                  totalSteps: routeResult.plan.steps.length,
                  steps: routeResult.plan.steps.map((s) => ({
                    stepNumber: s.stepNumber,
                    agent: s.agentName,
                    task: s.task,
                  })),
                },
              },
            });

            const planResult = await this.agentPlanExecutorService.executePlan({
              steps: routeResult.plan.steps,
              reasoning: routeResult.plan.reasoning,
              workspace,
              userWorkspaceId,
              recordIdsByObjectMetadataNameSingular,
              writer,
              onProgress: (progress) => {
                if (progress.type === 'step-started') {
                  this.logger.log(
                    `Starting step ${progress.stepNumber}: ${progress.agentName} - ${progress.task}`,
                  );
                  writer.write({
                    type: 'data-routing-status' as const,
                    id: `step-${progress.stepNumber}`,
                    data: {
                      text: `Step ${progress.stepNumber}/${routeResult.plan.steps.length}: ${progress.agentName} → ${progress.task}`,
                      state: 'loading',
                    },
                  });
                } else if (progress.type === 'step-completed') {
                  this.logger.log(
                    `Completed step ${progress.stepNumber}: ${progress.agentName}`,
                  );
                  writer.write({
                    type: 'data-routing-status' as const,
                    id: `step-${progress.stepNumber}`,
                    data: {
                      text: `Step ${progress.stepNumber}/${routeResult.plan.steps.length}: ✓ ${progress.agentName} completed`,
                      state: 'routed',
                    },
                  });
                }
              },
            });

            const systemMessage = messages.find((msg) => msg.role === 'system');
            let turnId: string | undefined;

            if (systemMessage && persistenceCallbacks.saveSystemMessage) {
              const savedSystemMessage =
                await persistenceCallbacks.saveSystemMessage({
                  role: AgentMessageRole.SYSTEM,
                  parts: systemMessage.parts,
                });

              turnId = savedSystemMessage.turnId;
            }

            const userMessage = await persistenceCallbacks.saveUserMessage(
              {
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
              turnId,
            );

            await persistenceCallbacks.saveAssistantMessage(
              {
                role: AgentMessageRole.ASSISTANT,
                parts: [
                  {
                    type: 'text',
                    text: planResult.finalOutput,
                  },
                ],
              },
              userMessage.turnId,
              '',
            );

            return;
          }

          const { agent, toolHints } = routeResult;

          this.logger.log(`Using agent ${agent.id} for message routing`);

          const agentExecutionStart = Date.now();

          const {
            stream: result,
            timings,
            contextInfo,
          } = await this.agentExecutionService.streamChatResponse({
            workspace,
            agentId: agent.id,
            userWorkspaceId,
            messages,
            recordIdsByObjectMetadataNameSingular,
            toolHints,
          });

          const routedStatusPart = {
            type: 'data-routing-status' as const,
            id: 'routing-status',
            data: {
              text: `Routed to ${agent.label} agent`,
              state: 'routed',
              debug: {
                routingTimeMs: routingTime,
                contextBuildTimeMs: timings.contextBuildTimeMs,
                agentExecutionStartTimeMs: Date.now() - startTime,
                selectedAgentId: agent.id,
                selectedAgentLabel: agent.label,
                availableAgents: debugInfo?.availableAgents,
                routerModel: debugInfo?.routerModel,
                agentModel: agent.modelId,
                context: contextInfo.contextString || undefined,
                contextRecordCount: contextInfo.contextRecordCount,
                contextSizeBytes: contextInfo.contextSizeBytes,
                routingPromptTokens: debugInfo?.promptTokens,
                routingCompletionTokens: debugInfo?.completionTokens,
                routingTotalTokens: debugInfo?.totalTokens,
                routingCostInCredits,
              },
            },
          };

          writer.write(routedStatusPart);

          writer.merge(
            result.toUIMessageStream({
              onError: (error) => {
                return error instanceof Error ? error.message : String(error);
              },
              sendStart: false,
              onFinish: async ({ responseMessage }) => {
                if (responseMessage.parts.length === 0) {
                  return;
                }

                const toolCallCount = responseMessage.parts.filter((part) =>
                  part.type.startsWith('tool-'),
                ).length;

                const tokenUsage = await this.extractTokenUsage(result.usage);

                const agentExecutionTime = Date.now() - agentExecutionStart;

                let agentCostInCredits: number | undefined;
                let totalCostInCredits: number | undefined;

                if (
                  agent.modelId &&
                  tokenUsage &&
                  tokenUsage.promptTokens > 0 &&
                  tokenUsage.completionTokens > 0
                ) {
                  try {
                    const agentCostInCents =
                      await this.aiBillingService.calculateCost(
                        agent.modelId as ModelId,
                        {
                          inputTokens: tokenUsage.promptTokens,
                          outputTokens: tokenUsage.completionTokens,
                          totalTokens: tokenUsage.totalTokens,
                        },
                      );

                    agentCostInCredits = Math.round(
                      convertCentsToBillingCredits(agentCostInCents),
                    );

                    totalCostInCredits =
                      (routingCostInCredits || 0) + agentCostInCredits;
                  } catch (error) {
                    this.logger.warn('Failed to calculate agent cost:', error);
                  }
                }

                const updatedRoutedStatusPart = {
                  ...routedStatusPart,
                  data: {
                    ...routedStatusPart.data,
                    debug: {
                      ...routedStatusPart.data.debug,
                      agentExecutionTimeMs: agentExecutionTime,
                      toolCallCount,
                      toolCount: timings.toolCount,
                      agentContextBuildTimeMs: timings.contextBuildTimeMs,
                      toolGenerationTimeMs: timings.toolGenerationTimeMs,
                      aiRequestPrepTimeMs: timings.aiRequestPrepTimeMs,
                      ...(tokenUsage && {
                        agentPromptTokens: tokenUsage.promptTokens,
                        agentCompletionTokens: tokenUsage.completionTokens,
                        agentTotalTokens: tokenUsage.totalTokens,
                      }),
                      agentCostInCredits,
                      totalCostInCredits,
                    },
                  },
                };

                writer.write(updatedRoutedStatusPart);

                const userMessage = await persistenceCallbacks.saveUserMessage(
                  {
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
                  undefined,
                );

                await persistenceCallbacks.saveAssistantMessage(
                  {
                    ...responseMessage,
                    parts: [updatedRoutedStatusPart, ...responseMessage.parts],
                  },
                  userMessage.turnId,
                  agent.id,
                );
              },
              sendReasoning: true,
            }),
          );
        },
      });

      pipeUIMessageStreamToResponse({ stream, response });
    } catch (error) {
      this.logger.error(
        'Failed to stream agent execution:',
        error instanceof Error ? error.message : String(error),
      );
      response.end();
    }
  }

  private async extractTokenUsage(
    usagePromise: Promise<unknown>,
  ): Promise<TokenUsage | null> {
    try {
      const usage = await usagePromise;

      const usageWithTokens = usage as {
        inputTokens?: number;
        outputTokens?: number;
        promptTokens?: number;
        completionTokens?: number;
        totalTokens?: number;
      };

      const tokenUsage = {
        promptTokens:
          usageWithTokens.inputTokens ?? usageWithTokens.promptTokens ?? 0,
        completionTokens:
          usageWithTokens.outputTokens ?? usageWithTokens.completionTokens ?? 0,
        totalTokens: usageWithTokens.totalTokens ?? 0,
      };

      this.logger.log(
        `Agent execution usage: ${tokenUsage.promptTokens} prompt + ${tokenUsage.completionTokens} completion = ${tokenUsage.totalTokens} total tokens`,
      );

      return tokenUsage;
    } catch (error) {
      this.logger.warn('Failed to get token usage:', error);

      return null;
    }
  }
}
