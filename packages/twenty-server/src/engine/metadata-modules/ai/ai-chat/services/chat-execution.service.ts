import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString, isObject } from '@sniptt/guards';
import {
  convertToModelMessages,
  type LanguageModelUsage,
  stepCountIs,
  type StepResult,
  streamText,
  type SystemModelMessage,
  type ToolSet,
  type UIDataTypes,
  type UIMessage,
  type UITools,
} from 'ai';
import { type APP_LOCALES } from 'twenty-shared/translations';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';

import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

import { type CodeExecutionStreamEmitter } from 'src/engine/core-modules/tool-provider/interfaces/code-execution-stream-emitter.type';

import { CodeInterpreterService } from 'src/engine/core-modules/code-interpreter/code-interpreter.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import {
  createExecuteToolTool,
  createLearnToolsTool,
  createLoadSkillTool,
  EXECUTE_TOOL_TOOL_NAME,
  LEARN_TOOLS_TOOL_NAME,
  LOAD_SKILL_TOOL_NAME,
} from 'src/engine/core-modules/tool-provider/tools';
import { estimateToolOutputTokens } from 'src/engine/core-modules/tool-provider/utils/estimate-tool-output-tokens.util';
import { getToolMetricName } from 'src/engine/core-modules/tool-provider/utils/get-tool-metric-name.util';
import { isToolOutputSuccessful } from 'src/engine/core-modules/tool-provider/utils/is-tool-output-successful.util';
import { resolveToolName } from 'src/engine/core-modules/tool-provider/utils/resolve-tool-name.util';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentActorContextService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-actor-context.service';
import { finalizeDanglingToolParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/finalize-dangling-tool-parts.util';
import { AGENT_CONFIG } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-config.const';
import { type BrowsingContextType } from 'src/engine/metadata-modules/ai/ai-agent/types/browsingContext.type';
import { repairToolCall } from 'src/engine/metadata-modules/ai/ai-agent/utils/repair-tool-call.util';
import { AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { convertDollarsToBillingCredits } from 'src/engine/metadata-modules/ai/ai-billing/utils/convert-dollars-to-billing-credits.util';
import { countNativeWebSearchCallsFromSteps } from 'src/engine/metadata-modules/ai/ai-billing/utils/count-native-web-search-calls-from-steps.util';
import {
  extractCacheCreationTokens,
  extractCacheCreationTokensFromSteps,
} from 'src/engine/metadata-modules/ai/ai-billing/utils/extract-cache-creation-tokens.util';
import { AI_CHAT_TOOL_NAMES_TO_PRELOAD } from 'src/engine/metadata-modules/ai/ai-chat/constants/ai-chat-tool-names-to-preload.const';
import { MessagePruningService } from 'src/engine/metadata-modules/ai/ai-chat/services/message-pruning.service';
import { SystemPromptBuilderService } from 'src/engine/metadata-modules/ai/ai-chat/services/system-prompt-builder.service';
import { type ExtractedFile } from 'src/engine/metadata-modules/ai/ai-chat/types/extracted-file.type';
import { extractCodeInterpreterFiles } from 'src/engine/metadata-modules/ai/ai-chat/utils/extract-code-interpreter-files.util';
import {
  getCacheProviderOptions,
  getCallLevelProviderOptions,
  injectCacheBreakpoint,
} from 'src/engine/metadata-modules/ai/ai-chat/utils/provider-options.util';
import { replaceUnsupportedFileParts } from 'src/engine/metadata-modules/ai/ai-chat/utils/replace-unsupported-file-parts.util';
import { AI_TELEMETRY_CONFIG } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-telemetry.const';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { NativeToolBinderService } from 'src/engine/metadata-modules/ai/ai-models/services/native-tool-binder.service';
import { type AiModelConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-config.type';
import { getNativeModelCapabilities } from 'src/engine/metadata-modules/ai/ai-models/utils/get-native-model-capabilities.util';
import { SkillService } from 'src/engine/metadata-modules/skill/skill.service';

export type ChatExecutionOptions = {
  workspace: WorkspaceEntity;
  userWorkspaceId: string;
  threadId?: string;
  messages: UIMessage<unknown, UIDataTypes, UITools>[];
  browsingContext: BrowsingContextType | null;
  onCodeExecutionUpdate?: CodeExecutionStreamEmitter;
  onCompaction?: () => void;
  modelId?: string;
  abortSignal?: AbortSignal;
  conversationSizeTokens: number;
};

export type ChatExecutionResult = {
  stream: ReturnType<typeof streamText>;
  modelConfig: AiModelConfig;
  hasNoMoreAvailableCredits: () => boolean;
};

@Injectable()
export class ChatExecutionService {
  private readonly logger = new Logger(ChatExecutionService.name);

  constructor(
    private readonly toolRegistry: ToolRegistryService,
    private readonly skillService: SkillService,
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly aiBillingService: AiBillingService,
    private readonly agentActorContextService: AgentActorContextService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    private readonly codeInterpreterService: CodeInterpreterService,
    private readonly systemPromptBuilder: SystemPromptBuilderService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
    private readonly nativeToolBinder: NativeToolBinderService,
    private readonly messagePruningService: MessagePruningService,
    private readonly metricsService: MetricsService,
  ) {}

  async streamChat({
    workspace,
    userWorkspaceId,
    threadId,
    messages,
    browsingContext,
    onCodeExecutionUpdate,
    onCompaction,
    modelId,
    abortSignal,
    conversationSizeTokens,
  }: ChatExecutionOptions): Promise<ChatExecutionResult> {
    const { actorContext, roleId, userId, userContext } =
      await this.agentActorContextService.buildUserAndAgentActorContext(
        userWorkspaceId,
        workspace.id,
      );

    const locale = userContext.locale as keyof typeof APP_LOCALES;

    const toolContext = {
      workspaceId: workspace.id,
      roleId,
      actorContext,
      userId,
      userWorkspaceId,
      threadId,
      locale,
      onCodeExecutionUpdate,
    };

    const toolCatalog = await this.toolRegistry.buildToolIndex(
      workspace.id,
      roleId,
      { userId, userWorkspaceId, locale },
    );

    const skillCatalog = await this.skillService.findAllFlatSkills(
      workspace.id,
    );

    this.logger.log(
      `Built tool catalog with ${toolCatalog.length} tools, ${skillCatalog.length} skills available`,
    );

    const preloadedTools = await this.toolRegistry.getToolsByName(
      AI_CHAT_TOOL_NAMES_TO_PRELOAD,
      toolContext,
      { compactOutput: true, spillLargeOutput: true },
    );

    const resolvedModelId = modelId ?? workspace.smartModel;

    this.aiModelRegistryService.validateModelAvailability(
      resolvedModelId,
      workspace,
    );

    const registeredModel =
      await this.aiModelRegistryService.resolveModelForAgent({
        modelId: resolvedModelId,
      });

    const modelConfig = this.aiModelRegistryService.getEffectiveModelConfig(
      registeredModel.modelId,
    );

    // Native and action search may both be bound here; the model picks at runtime.
    const nativeCapabilities = getNativeModelCapabilities(
      registeredModel.sdkPackage,
    );
    const nativeTools = this.nativeToolBinder.bind(registeredModel, {
      webSearch: nativeCapabilities?.webSearch === true,
      twitterSearch: nativeCapabilities?.twitterSearch === true,
    });

    // Tools the model can call directly: preloaded registry tools (already
    // serialized by the hydrator) plus SDK-native tools (opaque, never
    // serialized). execute_tool routes discovered tools through the registry.
    const directTools: ToolSet = {
      ...preloadedTools,
      ...nativeTools,
    };

    const preloadedToolNames = [
      ...Object.keys(preloadedTools),
      ...Object.keys(nativeTools),
    ];

    // ToolSet is constant for the entire conversation — no mutation.
    // learn_tools returns schemas as text; execute_tool dispatches via the registry.
    const activeTools: ToolSet = {
      ...directTools,
      [LEARN_TOOLS_TOOL_NAME]: createLearnToolsTool(
        this.toolRegistry,
        toolContext,
      ),
      [EXECUTE_TOOL_TOOL_NAME]: createExecuteToolTool(
        this.toolRegistry,
        toolContext,
        { compactOutput: true, spillLargeOutput: true },
      ),
      [LOAD_SKILL_TOOL_NAME]: createLoadSkillTool(
        (skillNames) =>
          this.skillService.findFlatSkillsByNames(skillNames, workspace.id),
        async () => {
          const allSkills = await this.skillService.findAllFlatSkills(
            workspace.id,
          );

          return allSkills.map((skill) => skill.name);
        },
      ),
    };

    const isCodeInterpreterEnabled = this.codeInterpreterService.isEnabled();

    let processedMessages: UIMessage[] = replaceUnsupportedFileParts(
      messages,
      modelConfig.modalities,
      isCodeInterpreterEnabled,
    );

    let storedFiles: Array<{
      filename: string;
      fileId: string;
    }> = [];

    if (isCodeInterpreterEnabled) {
      const extracted = extractCodeInterpreterFiles(processedMessages);

      processedMessages = extracted.processedMessages;

      if (extracted.extractedFiles.length > 0) {
        storedFiles = await this.storeExtractedFiles(
          extracted.extractedFiles,
          workspace.id,
        );
      }
    }

    if (isDefined(browsingContext)) {
      const contextString = this.buildContextFromBrowsingContext(
        workspace,
        browsingContext,
      );

      processedMessages = this.injectBrowsingContextIntoLastUserMessage(
        processedMessages,
        contextString,
      );
    }

    const systemPrompt = this.systemPromptBuilder.buildFullPrompt(
      toolCatalog,
      skillCatalog,
      preloadedToolNames,
      storedFiles,
      workspace.aiAdditionalInstructions ?? undefined,
      userContext,
    );

    this.logger.log(
      `Starting chat execution with model ${registeredModel.modelId}, ${Object.keys(activeTools).length} active tools`,
    );

    const systemMessage: SystemModelMessage = {
      role: 'system',
      content: systemPrompt,
      providerOptions: getCacheProviderOptions(registeredModel.sdkPackage),
    };

    const sanitizedMessages = processedMessages.map((message) => ({
      ...message,
      parts: finalizeDanglingToolParts(message.parts),
    }));

    const rawModelMessages = await convertToModelMessages(sanitizedMessages);

    const pruningResult =
      this.messagePruningService.pruneIfOverContextWindowLimit(
        rawModelMessages,
        modelConfig.contextWindowTokens,
        conversationSizeTokens,
      );

    if (pruningResult.isStillOverLimit) {
      throw new Error(
        'This conversation is too long for the model to process. Please start a new thread.',
      );
    }

    if (pruningResult.wasPruned) {
      onCompaction?.();
    }

    const modelMessages = pruningResult.messages;

    let hasNoMoreAvailableCredits = false;
    const streamStartedAt = performance.now();
    let stepStartedAt = streamStartedAt;
    let ttftRecorded = false;
    let stepIndex = 0;

    const emitTurnUsageEvent = async (steps: StepResult<ToolSet>[]) => {
      const usage = steps.reduce<LanguageModelUsage>(
        (acc, step) => ({
          inputTokens: (acc.inputTokens ?? 0) + (step.usage.inputTokens ?? 0),
          outputTokens:
            (acc.outputTokens ?? 0) + (step.usage.outputTokens ?? 0),
          totalTokens: (acc.totalTokens ?? 0) + (step.usage.totalTokens ?? 0),
          inputTokenDetails: {
            noCacheTokens:
              (acc.inputTokenDetails?.noCacheTokens ?? 0) +
              (step.usage.inputTokenDetails?.noCacheTokens ?? 0),
            cacheReadTokens:
              (acc.inputTokenDetails?.cacheReadTokens ?? 0) +
              (step.usage.inputTokenDetails?.cacheReadTokens ?? 0),
            cacheWriteTokens:
              (acc.inputTokenDetails?.cacheWriteTokens ?? 0) +
              (step.usage.inputTokenDetails?.cacheWriteTokens ?? 0),
          },
          outputTokenDetails: {
            textTokens:
              (acc.outputTokenDetails?.textTokens ?? 0) +
              (step.usage.outputTokenDetails?.textTokens ?? 0),
            reasoningTokens:
              (acc.outputTokenDetails?.reasoningTokens ?? 0) +
              (step.usage.outputTokenDetails?.reasoningTokens ?? 0),
          },
        }),
        {
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
          inputTokenDetails: {
            noCacheTokens: 0,
            cacheReadTokens: 0,
            cacheWriteTokens: 0,
          },
          outputTokenDetails: { textTokens: 0, reasoningTokens: 0 },
        },
      );

      const cacheCreationTokens = extractCacheCreationTokensFromSteps(steps);
      const totalTokens =
        (usage.inputTokens ?? 0) +
        (usage.outputTokens ?? 0) +
        cacheCreationTokens;

      const costInDollars = this.aiBillingService.calculateCost(
        registeredModel.modelId,
        { usage, cacheCreationTokens },
      );
      const creditsUsedMicro = Math.round(
        convertDollarsToBillingCredits(costInDollars),
      );

      await this.aiBillingService.emitAiTokenUsageEvent(
        workspace.id,
        creditsUsedMicro,
        totalTokens,
        registeredModel.modelId,
        UsageOperationType.AI_CHAT_TOKEN,
        null,
        userWorkspaceId,
      );

      // billNativeWebSearchUsage short-circuits when count <= 0, so calling
      // unconditionally is safe regardless of whether native search fired.
      void this.aiBillingService.billNativeWebSearchUsage(
        countNativeWebSearchCallsFromSteps(steps),
        workspace.id,
        userWorkspaceId,
      );

      const modelAttr = { model: registeredModel.modelId };

      this.metricsService.incrementCounterBy({
        key: MetricsKeys.AiChatInputTokens,
        amount: usage.inputTokens ?? 0,
        attributes: modelAttr,
      });
      this.metricsService.incrementCounterBy({
        key: MetricsKeys.AiChatOutputTokens,
        amount: usage.outputTokens ?? 0,
        attributes: modelAttr,
      });
      this.metricsService.incrementCounterBy({
        key: MetricsKeys.AiChatCacheReadTokens,
        amount: usage.inputTokenDetails?.cacheReadTokens ?? 0,
        attributes: modelAttr,
      });
      this.metricsService.incrementCounterBy({
        key: MetricsKeys.AiChatCacheWriteTokens,
        amount: cacheCreationTokens,
        attributes: modelAttr,
      });
      this.metricsService.recordHistogram({
        key: MetricsKeys.AiChatTurnLatencyMs,
        value: performance.now() - streamStartedAt,
        unit: 'ms',
        attributes: modelAttr,
      });
    };

    const stream = streamText({
      model: registeredModel.model,
      messages: [systemMessage, ...modelMessages],
      tools: activeTools,
      abortSignal,
      stopWhen: (step) =>
        stepCountIs(AGENT_CONFIG.MAX_STEPS)(step) || hasNoMoreAvailableCredits,
      experimental_telemetry: AI_TELEMETRY_CONFIG,
      providerOptions: getCallLevelProviderOptions({
        sdkPackage: registeredModel.sdkPackage,
        providerOptions: undefined,
        promptCacheKey: threadId,
      }),
      prepareStep: ({ messages }) => {
        stepStartedAt = performance.now();

        return {
          messages: injectCacheBreakpoint(messages, registeredModel.sdkPackage),
        };
      },
      onChunk: ({ chunk }) => {
        if (
          !ttftRecorded &&
          (chunk.type === 'text-delta' || chunk.type === 'tool-call')
        ) {
          ttftRecorded = true;
          this.metricsService.recordHistogram({
            key: MetricsKeys.AiChatTtftMs,
            value: performance.now() - streamStartedAt,
            unit: 'ms',
            attributes: { model: registeredModel.modelId },
          });
        }
      },
      onStepFinish: async (step) => {
        this.metricsService.recordHistogram({
          key: MetricsKeys.AiChatStepLatencyMs,
          value: performance.now() - stepStartedAt,
          unit: 'ms',
          attributes: { model: registeredModel.modelId },
        });

        const { hasNoMoreAvailableCredits: stepHasNoMoreAvailableCredits } =
          await this.aiBillingService.decrementAndCheckAvailableCredits(
            registeredModel.modelId,
            {
              usage: step.usage,
              cacheCreationTokens: extractCacheCreationTokens(
                step.providerMetadata,
              ),
            },
            workspace.id,
          );

        if (stepHasNoMoreAvailableCredits) {
          hasNoMoreAvailableCredits = true;
        }

        this.logger.log(
          `[AI_CHAT_TOKENS] step #${++stepIndex} — ` +
            `toolCallIds=[${step.toolCalls.map((toolCall) => toolCall.toolCallId).join(', ')}]: ` +
            `outputTokens=${step.usage.outputTokens ?? 0}, ` +
            `reasoningTokens=${step.usage.outputTokenDetails?.reasoningTokens ?? 0}, ` +
            `inputTokens(fullContext)=${step.usage.inputTokens ?? 0}, ` +
            `cacheReadTokens=${step.usage.inputTokenDetails?.cacheReadTokens ?? 0}, ` +
            `cacheWriteTokens=${step.usage.inputTokenDetails?.cacheWriteTokens ?? 0}, ` +
            `cacheCreationTokens=${extractCacheCreationTokens(step.providerMetadata)}, ` +
            `totalTokens=${step.usage.totalTokens ?? 0}`,
        );

        for (const part of step.content) {
          if (part.type !== 'tool-result' && part.type !== 'tool-error') {
            continue;
          }

          const succeeded =
            part.type === 'tool-result' && isToolOutputSuccessful(part.output);

          const outputTokens = estimateToolOutputTokens(
            part.type === 'tool-result' ? part.output : part.error,
          );

          const executionAttributes = {
            model: registeredModel.modelId,
            tool: getToolMetricName(resolveToolName(part)),
          };

          this.metricsService.incrementCounterBy({
            key: succeeded
              ? MetricsKeys.AiChatToolExecutionSucceeded
              : MetricsKeys.AiChatToolExecutionFailed,
            amount: 1,
            attributes: executionAttributes,
          });

          this.metricsService.recordHistogram({
            key: MetricsKeys.AiChatToolOutputTokens,
            value: outputTokens,
            unit: 'token',
            attributes: executionAttributes,
          });

          const { input } = part;

          if (part.toolName === LEARN_TOOLS_TOOL_NAME) {
            const learntToolNames =
              isObject(input) && 'toolNames' in input
                ? input.toolNames
                : undefined;

            for (const learntToolName of Array.isArray(learntToolNames)
              ? learntToolNames.filter(isNonEmptyString)
              : []) {
              this.metricsService.incrementCounterBy({
                key: succeeded
                  ? MetricsKeys.AiChatToolLearnedSucceeded
                  : MetricsKeys.AiChatToolLearnedFailed,
                amount: 1,
                attributes: {
                  model: registeredModel.modelId,
                  tool: getToolMetricName(learntToolName),
                },
              });
            }
          }

          if (part.toolName === LOAD_SKILL_TOOL_NAME) {
            const loadedSkillNames =
              isObject(input) && 'skillNames' in input
                ? input.skillNames
                : undefined;

            for (const loadedSkillName of Array.isArray(loadedSkillNames)
              ? loadedSkillNames.filter(isNonEmptyString)
              : []) {
              this.metricsService.incrementCounterBy({
                key: succeeded
                  ? MetricsKeys.AiChatSkillLoadedSucceeded
                  : MetricsKeys.AiChatSkillLoadedFailed,
                amount: 1,
                attributes: {
                  model: registeredModel.modelId,
                  skill: loadedSkillName,
                },
              });
            }
          }
        }
      },
      onAbort: async ({ steps }) => {
        await emitTurnUsageEvent(steps);
      },
      experimental_repairToolCall: async ({
        toolCall,
        tools: toolsForRepair,
        inputSchema,
        error,
      }) => {
        return repairToolCall({
          toolCall,
          tools: toolsForRepair,
          inputSchema,
          error,
          model: registeredModel.model,
          billingContext: {
            aiBillingService: this.aiBillingService,
            modelId: registeredModel.modelId,
            workspaceId: workspace.id,
            userWorkspaceId,
            operationType: UsageOperationType.AI_CHAT_TOKEN,
          },
        });
      },
    });

    Promise.all([stream.usage, stream.steps])
      .then(async ([, steps]) => {
        await emitTurnUsageEvent(steps);
      })
      .catch((error) => {
        if (error?.name === 'AbortError') {
          return;
        }
        this.exceptionHandlerService.captureExceptions([error]);
      });

    return {
      stream,
      modelConfig,
      hasNoMoreAvailableCredits: () => hasNoMoreAvailableCredits,
    };
  }

  private injectBrowsingContextIntoLastUserMessage(
    messages: UIMessage[],
    contextString: string,
  ): UIMessage[] {
    const lastUserIndex = messages
      .map((message) => message.role)
      .lastIndexOf('user');

    if (lastUserIndex === -1) {
      return messages;
    }

    const lastUserMessage = messages[lastUserIndex];
    const browsingContextPart = {
      type: 'text' as const,
      text: `<browsing_context note="Only use this if the user explicitly asks about the current page, record, or view. Do not call any tools based on this context.">\n${contextString}\n</browsing_context>`,
    };

    return [
      ...messages.slice(0, lastUserIndex),
      {
        ...lastUserMessage,
        parts: [...lastUserMessage.parts, browsingContextPart],
      },
      ...messages.slice(lastUserIndex + 1),
    ];
  }

  private buildContextFromBrowsingContext(
    workspace: WorkspaceEntity,
    browsingContext: BrowsingContextType,
  ): string {
    if (browsingContext.type === 'recordPage') {
      return this.buildRecordPageContext(
        workspace,
        browsingContext.objectNameSingular,
        browsingContext.recordId,
        browsingContext.pageLayoutId,
        browsingContext.activeTabId,
      );
    }

    if (browsingContext.type === 'listView') {
      return this.buildListViewContext(browsingContext);
    }

    return '';
  }

  private buildRecordPageContext(
    workspace: WorkspaceEntity,
    objectNameSingular: string,
    recordId: string,
    pageLayoutId?: string,
    activeTabId?: string | null,
  ): string {
    const resourceUrl = this.workspaceDomainsService.buildWorkspaceURL({
      workspace,
      pathname: getAppPath(AppPath.RecordShowPage, {
        objectNameSingular,
        objectRecordId: recordId,
      }),
    });

    let context = `The user is viewing a ${objectNameSingular} record (ID: ${recordId}, URL: ${resourceUrl}). Use tools to fetch record details if needed.`;

    if (isDefined(pageLayoutId)) {
      context += `\nPage layout ID: ${pageLayoutId}.`;
    }

    if (isDefined(activeTabId)) {
      context += `\nActive tab ID: ${activeTabId}.`;
    }

    return context;
  }

  private buildListViewContext(browsingContext: {
    type: 'listView';
    objectNameSingular: string;
    viewId: string;
    viewName: string;
    filterDescriptions: string[];
  }): string {
    const { objectNameSingular, viewId, viewName, filterDescriptions } =
      browsingContext;

    let context = `The user is viewing a list of ${objectNameSingular} records in a view called "${viewName}" (viewId: ${viewId}).`;

    if (filterDescriptions.length > 0) {
      context += `\nFilters applied: ${filterDescriptions.join(', ')}`;
    }

    context += `\nUse get_view_query_parameters tool with this viewId to get the exact filter/sort parameters for querying records.`;

    return context;
  }

  private async storeExtractedFiles(
    files: ExtractedFile[],
    _workspaceId: string,
  ): Promise<Array<{ filename: string; fileId: string }>> {
    return files.map((file) => ({
      filename: file.filename,
      fileId: file.fileId,
    }));
  }
}
