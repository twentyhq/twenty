import { injectChatMessageSenders } from 'src/engine/metadata-modules/ai/ai-chat/utils/inject-chat-message-senders.util';
import { AgentChatActorService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-actor.service';
import { type ToolContext } from 'src/engine/core-modules/tool-provider/types/tool-context.type';
import { Injectable, Logger } from '@nestjs/common';

import {
  convertToModelMessages,
  hasToolCall,
  NoOutputGeneratedError,
  isStepCount,
  type StepResult,
  streamText,
  type SystemModelMessage,
  type ToolSet,
} from 'ai';
import {
  ASK_QUESTIONS_TOOL_NAME,
  ATTACH_CONVERSATION_TO_RECORD_TOOL_NAME,
  COMPLETE_WORKSPACE_SETUP_TOOL_NAME,
  type ExtendedUIMessage,
  PROPOSE_TOOL_CALL_TOOL_NAME,
  REQUEST_FORM_TOOL_NAME,
} from 'twenty-shared/ai';
import { type APP_LOCALES } from 'twenty-shared/translations';
import { AppPath, FeatureFlagKey } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';

import { AI_LATENCY_MS_BUCKET_BOUNDARIES } from 'src/engine/core-modules/metrics/constants/ai-latency-ms-bucket-boundaries.constant';
import { TOOL_EXECUTION_DURATION_MS_BUCKET_BOUNDARIES } from 'src/engine/core-modules/metrics/constants/tool-execution-duration-ms-bucket-boundaries.constant';
import { TOOL_OUTPUT_TOKENS_BUCKET_BOUNDARIES } from 'src/engine/core-modules/metrics/constants/tool-output-tokens-bucket-boundaries.constant';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

import { type CodeExecutionStreamEmitter } from 'src/engine/core-modules/tool-provider/interfaces/code-execution-stream-emitter.type';

import { CodeInterpreterService } from 'src/engine/core-modules/code-interpreter/code-interpreter.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
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
import { resolveProposedToolCall } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/resolve-proposed-tool-call.util';
import { endsOnPausingToolCall } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/ends-on-pausing-tool-call.util';
import { finalizeDanglingToolParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/finalize-dangling-tool-parts.util';
import { guideUncallableToolCallsToMetaTool } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/guide-uncallable-tool-calls-to-meta-tool.util';
import { AGENT_CONFIG } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-config.const';
import { BrowsingContextType } from 'src/engine/metadata-modules/ai/ai-agent/types/browsing-context.type';
import { repairToolCall } from 'src/engine/metadata-modules/ai/ai-agent/utils/repair-tool-call.util';
import { AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { convertDollarsToCreditsMicro } from 'src/engine/metadata-modules/ai/ai-billing/utils/convert-dollars-to-credits-micro.util';
import { countNativeWebSearchCallsFromSteps } from 'src/engine/metadata-modules/ai/ai-billing/utils/count-native-web-search-calls-from-steps.util';
import {
  extractCacheCreationTokens,
  extractCacheCreationTokensFromSteps,
} from 'src/engine/metadata-modules/ai/ai-billing/utils/extract-cache-creation-tokens.util';
import { AI_CHAT_EXCLUDED_TOOL_NAMES } from 'src/engine/metadata-modules/ai/ai-chat/constants/ai-chat-excluded-tool-names.const';
import { AI_CHAT_STREAM_FUNCTION_ID } from 'src/engine/metadata-modules/ai/ai-chat/constants/ai-chat-stream-function-id.constant';
import { AI_CHAT_TOOL_NAMES_TO_PRELOAD } from 'src/engine/metadata-modules/ai/ai-chat/constants/ai-chat-tool-names-to-preload.const';
import { AI_CHAT_WORKSPACE_SETUP_STREAM_FUNCTION_ID } from 'src/engine/metadata-modules/ai/ai-chat/constants/ai-chat-workspace-setup-stream-function-id.constant';
import { AgentChatThreadTargetService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-target.service';
import { MessagePruningService } from 'src/engine/metadata-modules/ai/ai-chat/services/message-pruning.service';
import { createAskQuestionsTool } from 'src/engine/metadata-modules/ai/ai-chat/tools/ask-questions.tool';
import { createAttachConversationToRecordTool } from 'src/engine/metadata-modules/ai/ai-chat/tools/attach-conversation-to-record.tool';
import { createProposeToolCallTool } from 'src/engine/metadata-modules/ai/ai-chat/tools/propose-tool-call.tool';
import { createRequestFormTool } from 'src/engine/metadata-modules/ai/ai-chat/tools/request-form.tool';
import { createCompleteWorkspaceSetupTool } from 'src/engine/metadata-modules/ai/ai-chat/tools/complete-workspace-setup.tool';
import { type AgentChatSender } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-sender.type';
import { type UploadedFileReference } from 'src/engine/metadata-modules/ai/ai-chat/types/uploaded-file-reference.type';
import { formatErrorWithCause } from 'src/engine/metadata-modules/ai/ai-chat/utils/format-error-with-cause.util';
import { buildWorkspaceSetupChatThreadId } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-workspace-setup-chat-thread-id.util';
import { buildFullSystemPrompt } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-full-system-prompt.util';
import { hasNoAssistantMessage } from 'src/engine/metadata-modules/ai/ai-chat/utils/has-no-assistant-message.util';
import { hasSucceededWorkspaceSetupCompletion } from 'src/engine/metadata-modules/ai/ai-chat/utils/has-succeeded-workspace-setup-completion.util';
import { collectReferencedSkillIds } from 'src/engine/metadata-modules/ai/ai-chat/utils/collect-referenced-skill-ids.util';
import { collectUploadedFileReferences } from 'src/engine/metadata-modules/ai/ai-chat/utils/collect-uploaded-file-references.util';
import { extractCodeInterpreterFiles } from 'src/engine/metadata-modules/ai/ai-chat/utils/extract-code-interpreter-files.util';
import { injectMessageTimestamps } from 'src/engine/metadata-modules/ai/ai-chat/utils/inject-message-timestamps.util';
import {
  getCacheProviderOptions,
  getCallLevelProviderOptions,
  injectCacheBreakpoint,
} from 'src/engine/metadata-modules/ai/ai-chat/utils/provider-options.util';
import { replaceUnsupportedFileParts } from 'src/engine/metadata-modules/ai/ai-chat/utils/replace-unsupported-file-parts.util';
import { tagAiChatExecutionScope } from 'src/engine/metadata-modules/ai/ai-chat/utils/tag-ai-chat-execution-scope.util';
import { buildAiTelemetry } from 'src/engine/metadata-modules/ai/ai-models/utils/build-ai-telemetry.util';
import { AiModelConfigService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-config.service';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { NativeToolBinderService } from 'src/engine/metadata-modules/ai/ai-models/services/native-tool-binder.service';
import { type AiModelConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-config.type';
import { getNativeModelCapabilities } from 'src/engine/metadata-modules/ai/ai-models/utils/get-native-model-capabilities.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { SkillService } from 'src/engine/metadata-modules/skill/skill.service';
import { getChatModelId } from 'src/engine/metadata-modules/ai/ai-models/utils/get-chat-model-id.util';

export type ChatExecutionOptions = {
  workspace: WorkspaceEntity;
  userWorkspaceId: string;
  sender: AgentChatSender;
  authorization: Awaited<ReturnType<AgentChatActorService['authorize']>>;
  threadId: string;
  streamId: string;
  turnId: string;
  messages: ExtendedUIMessage[];
  browsingContext: BrowsingContextType | null;
  onCodeExecutionUpdate: CodeExecutionStreamEmitter;
  onCompaction: () => void;
  modelId?: string;
  abortSignal: AbortSignal;
  conversationSizeTokens: number;
};

export type ChatExecutionResult = {
  stream: ReturnType<typeof streamText>;
  modelConfig: AiModelConfig;
  hasNoMoreAvailableCredits: () => boolean;
  getStreamError: () => unknown;
};

@Injectable()
export class ChatExecutionService {
  private readonly logger = new Logger(ChatExecutionService.name);

  constructor(
    private readonly toolRegistry: ToolRegistryService,
    private readonly skillService: SkillService,
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly aiModelConfigService: AiModelConfigService,
    private readonly aiBillingService: AiBillingService,
    private readonly agentActorContextService: AgentActorContextService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    private readonly codeInterpreterService: CodeInterpreterService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
    private readonly nativeToolBinder: NativeToolBinderService,
    private readonly messagePruningService: MessagePruningService,
    private readonly metricsService: MetricsService,
    private readonly chatActorService: AgentChatActorService,
    private readonly agentChatThreadTargetService: AgentChatThreadTargetService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  async streamChat({
    workspace,
    userWorkspaceId,
    sender,
    authorization,
    threadId,
    streamId,
    turnId,
    messages,
    browsingContext,
    onCodeExecutionUpdate,
    onCompaction,
    modelId,
    abortSignal,
    conversationSizeTokens,
  }: ChatExecutionOptions): Promise<ChatExecutionResult> {
    const resolveExecutionContext = async (): Promise<ToolContext> => {
      const authorization = await this.chatActorService.authorize({
        workspaceId: workspace.id,
        threadId,
        sender,
      });
      return {
        ...toolContext,
        ...authorization,
        resolveExecutionContext: undefined,
      };
    };
    const { actorContext, roleId, userId, userContext } =
      await this.agentActorContextService.buildUserAndAgentActorContext(
        userWorkspaceId,
        workspace.id,
      );

    const locale = userContext.locale as keyof typeof APP_LOCALES;

    const toolContext: ToolContext = {
      workspaceId: workspace.id,
      actorContext,
      userId,
      userWorkspaceId,
      threadId,
      locale,
      onCodeExecutionUpdate,
      ...authorization,
      resolveExecutionContext,
    };

    const toolCatalog = await this.toolRegistry.buildToolIndex(
      workspace.id,
      roleId,
      {
        userId,
        userWorkspaceId,
        locale,
        excludeTools: AI_CHAT_EXCLUDED_TOOL_NAMES,
        rolePermissionConfig: toolContext.rolePermissionConfig,
      },
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

    const resolvedModelId = getChatModelId({
      requestedModelId: modelId,
      workspace,
    });

    this.aiModelRegistryService.validateModelAvailability(resolvedModelId);

    const registeredModel =
      await this.aiModelRegistryService.resolveModelForAgent(
        { modelId: resolvedModelId },
        workspace,
      );

    const modelConfig = this.aiModelRegistryService.getEffectiveModelConfig(
      registeredModel.modelId,
    );

    const nativeCapabilities = getNativeModelCapabilities(
      registeredModel.sdkPackage,
    );
    const nativeTools = this.nativeToolBinder.bind(registeredModel, {
      webSearch: nativeCapabilities?.webSearch === true,
      twitterSearch: nativeCapabilities?.twitterSearch === true,
    });

    const isWorkspaceSetupConversation =
      threadId ===
      buildWorkspaceSetupChatThreadId({
        workspaceId: workspace.id,
        userWorkspaceId,
      });

    const isWorkspaceSetupThread =
      isWorkspaceSetupConversation &&
      !hasSucceededWorkspaceSetupCompletion(messages);

    const isWorkspaceSetupKickoffTurn =
      isWorkspaceSetupThread && hasNoAssistantMessage(messages);

    tagAiChatExecutionScope({
      isWorkspaceSetupThread,
      modelId: registeredModel.modelId,
    });

    // judged on the conversation, not setup status: onboarding continues here after setup completes
    const canAttachConversationToRecords =
      !isWorkspaceSetupConversation &&
      (await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_CONVERSATIONS_TAB_ENABLED,
        workspace.id,
      ));

    const isToolAllowed = (toolName: string) =>
      !AI_CHAT_EXCLUDED_TOOL_NAMES.has(toolName);

    const preloadedToolSet: ToolSet = {
      ...preloadedTools,
      ...nativeTools,
      [ASK_QUESTIONS_TOOL_NAME]: createAskQuestionsTool({
        isWorkspaceSetupThread,
      }),
      [REQUEST_FORM_TOOL_NAME]: createRequestFormTool(),
      [PROPOSE_TOOL_CALL_TOOL_NAME]: createProposeToolCallTool({
        resolveProposal: (input) =>
          resolveProposedToolCall({
            input,
            findTool: async (toolName) =>
              toolCatalog.find(
                (toolIndexEntry) => toolIndexEntry.name === toolName,
              ),
            executeTool: ({ toolName, args }) =>
              this.toolRegistry.resolveAndExecute(toolName, args, toolContext),
          }),
      }),
      ...(isWorkspaceSetupThread
        ? {
            [COMPLETE_WORKSPACE_SETUP_TOOL_NAME]:
              createCompleteWorkspaceSetupTool(),
          }
        : {}),
      ...(canAttachConversationToRecords
        ? {
            [ATTACH_CONVERSATION_TO_RECORD_TOOL_NAME]:
              createAttachConversationToRecordTool({
                agentChatThreadTargetService: this.agentChatThreadTargetService,
                toolContext,
              }),
          }
        : {}),
    };

    const activeTools: ToolSet = {
      ...preloadedToolSet,
      [LEARN_TOOLS_TOOL_NAME]: createLearnToolsTool(
        this.toolRegistry,
        toolContext,
        {
          spillLargeOutput: true,
          isToolAllowed,
        },
      ),
      [EXECUTE_TOOL_TOOL_NAME]: createExecuteToolTool(
        this.toolRegistry,
        toolContext,
        {
          compactOutput: true,
          spillLargeOutput: true,
          isToolAllowed,
        },
      ),
      [LOAD_SKILL_TOOL_NAME]: createLoadSkillTool(
        (skillNames) =>
          this.skillService.findFlatSkillsByNames(skillNames, workspace.id),
        async () => skillCatalog.map((skill) => skill.name),
      ),
    };

    const isCodeInterpreterEnabled = this.codeInterpreterService.isEnabled();

    const uploadedFiles = collectUploadedFileReferences(messages);

    // inline tagged skills to save the model a load_skills round trip
    const referencedSkills = await this.skillService.findFlatSkillsByIds(
      collectReferencedSkillIds(messages),
      workspace.id,
    );

    let processedMessages: ExtendedUIMessage[] = replaceUnsupportedFileParts(
      messages,
      modelConfig.modalities,
      isCodeInterpreterEnabled,
    );

    let codeInterpreterFiles: UploadedFileReference[] = [];

    if (isCodeInterpreterEnabled) {
      const extracted = extractCodeInterpreterFiles(processedMessages);

      processedMessages = extracted.processedMessages;
      codeInterpreterFiles = extracted.extractedFiles.map(
        ({ filename, fileId }) => ({ filename, fileId }),
      );
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

    processedMessages = injectChatMessageSenders({
      messages: processedMessages,
      currentUserWorkspaceId: userWorkspaceId,
    });
    processedMessages = injectMessageTimestamps(
      processedMessages,
      userContext.timezone,
    );

    const systemPrompt = buildFullSystemPrompt({
      toolCatalog,
      skillCatalog,
      referencedSkills,
      preloadedTools: Object.keys(preloadedToolSet),
      uploadedFilesContext: { uploadedFiles, codeInterpreterFiles },
      workspaceInstructions: workspace.aiAdditionalInstructions ?? undefined,
      userContext,
      userWorkspaceId,
      isWorkspaceSetupThread,
      canAttachConversationToRecords,
    });

    this.logger.log(
      `Starting chat execution with model ${registeredModel.modelId}, ${Object.keys(activeTools).length} active tools`,
    );

    const systemMessage: SystemModelMessage = {
      role: 'system',
      content: systemPrompt,
      providerOptions: getCacheProviderOptions(registeredModel.sdkPackage),
    };

    const sanitizedMessages = this.sanitizeMessagePartsForModel(
      processedMessages,
      new Set(Object.keys(activeTools)),
    );

    const rawModelMessages = await convertToModelMessages(sanitizedMessages);

    const pruningResult =
      this.messagePruningService.pruneIfOverContextWindowLimit(
        rawModelMessages,
        modelConfig.contextWindowTokens,
        conversationSizeTokens,
      );

    if (pruningResult.isStillOverLimit) {
      throw new AiException(
        'This conversation is too long for the model to process. Please start a new thread.',
        AiExceptionCode.CONTEXT_WINDOW_EXCEEDED,
      );
    }

    if (pruningResult.wasPruned) {
      onCompaction();
    }

    const modelMessages = pruningResult.messages;

    let hasNoMoreAvailableCredits = false;
    const streamStartedAt = performance.now();
    let stepStartedAt = streamStartedAt;
    let ttftRecorded = false;
    let stepIndex = 0;
    let lastUnderlyingStreamError: unknown;

    const emitTurnUsageEvent = async (steps: StepResult<ToolSet>[]) => {
      const usage = steps.reduce(
        (totals, step) => ({
          inputTokens: totals.inputTokens + (step.usage.inputTokens ?? 0),
          outputTokens: totals.outputTokens + (step.usage.outputTokens ?? 0),
          cacheReadTokens:
            totals.cacheReadTokens +
            (step.usage.inputTokenDetails?.cacheReadTokens ?? 0),
        }),
        { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0 },
      );

      const cacheCreationTokens = extractCacheCreationTokensFromSteps(steps);
      const totalTokens = usage.inputTokens + usage.outputTokens;

      const costInDollars = this.aiBillingService.calculateStepsCost(
        registeredModel.modelId,
        steps,
      );
      const creditsUsedMicro = convertDollarsToCreditsMicro(costInDollars);

      await this.aiBillingService.emitAiTokenUsageEvent(
        workspace.id,
        creditsUsedMicro,
        totalTokens,
        registeredModel.modelId,
        UsageOperationType.AI_CHAT_TOKEN,
        null,
        userWorkspaceId,
      );

      void this.aiBillingService.billNativeWebSearchUsage(
        countNativeWebSearchCallsFromSteps(steps),
        workspace.id,
        userWorkspaceId,
      );

      const modelAttr = { model: registeredModel.modelId };

      this.metricsService.incrementCounterBy({
        key: MetricsKeys.AiChatInputTokens,
        amount: usage.inputTokens,
        attributes: modelAttr,
      });
      this.metricsService.incrementCounterBy({
        key: MetricsKeys.AiChatOutputTokens,
        amount: usage.outputTokens,
        attributes: modelAttr,
      });
      this.metricsService.incrementCounterBy({
        key: MetricsKeys.AiChatCacheReadTokens,
        amount: usage.cacheReadTokens,
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
        bucketBoundaries: AI_LATENCY_MS_BUCKET_BOUNDARIES,
      });
    };

    const stream = streamText({
      model: registeredModel.model,
      instructions: systemMessage,
      messages: modelMessages,
      tools: activeTools,
      // Every step of the kickoff turn is forced so it cannot end in prose; stopWhen ends it at the first pausing tool call.
      toolChoice: isWorkspaceSetupKickoffTurn ? 'required' : 'auto',
      abortSignal,
      stopWhen: (step) =>
        isStepCount(AGENT_CONFIG.MAX_STEPS)(step) ||
        endsOnPausingToolCall({ steps: step.steps }) ||
        hasToolCall(COMPLETE_WORKSPACE_SETUP_TOOL_NAME)(step) ||
        hasNoMoreAvailableCredits,
      ...buildAiTelemetry({
        functionId: isWorkspaceSetupThread
          ? AI_CHAT_WORKSPACE_SETUP_STREAM_FUNCTION_ID
          : AI_CHAT_STREAM_FUNCTION_ID,
        workspaceId: workspace.id,
        userWorkspaceId,
        threadId,
        turnId,
        streamId,
      }),
      providerOptions: getCallLevelProviderOptions({
        sdkPackage: registeredModel.sdkPackage,
        providerOptions: this.aiModelConfigService.getReasoningProviderOptions(
          registeredModel,
          { shouldIncludeReasoningSummary: true },
        ),
        promptCacheKey: threadId,
      }),
      prepareStep: async ({ messages }) => {
        await this.chatActorService.authorize({
          workspaceId: workspace.id,
          threadId,
          sender,
        });
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
            bucketBoundaries: AI_LATENCY_MS_BUCKET_BOUNDARIES,
          });
        }
      },
      onError: ({ error }) => {
        lastUnderlyingStreamError = error;
        this.logger.error(
          `Stream ${streamId} emitted an error: ${formatErrorWithCause(error)}`,
        );
      },
      onToolExecutionEnd: (event) => {
        this.metricsService.recordHistogram({
          key: MetricsKeys.AiChatToolExecutionDurationMs,
          value: event.toolExecutionMs,
          unit: 'ms',
          attributes: {
            model: registeredModel.modelId,
            tool: getToolMetricName(event.toolCall.toolName),
          },
          bucketBoundaries: TOOL_EXECUTION_DURATION_MS_BUCKET_BOUNDARIES,
        });
      },
      onStepEnd: async (step) => {
        this.metricsService.recordHistogram({
          key: MetricsKeys.AiChatStepLatencyMs,
          value: performance.now() - stepStartedAt,
          unit: 'ms',
          attributes: { model: registeredModel.modelId },
          bucketBoundaries: AI_LATENCY_MS_BUCKET_BOUNDARIES,
        });

        const { hasNoMoreAvailableCredits: stepHasNoMoreAvailableCredits } =
          await this.aiBillingService.decrementAndCheckAvailableCredits({
            modelId: registeredModel.modelId,
            billingInput: {
              usage: step.usage,
              cacheCreationTokens: extractCacheCreationTokens(
                step.providerMetadata,
              ),
            },
            workspaceId: workspace.id,
            operationType: UsageOperationType.AI_CHAT_TOKEN,
            spenders: { userWorkspaceId },
          });

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
            bucketBoundaries: TOOL_OUTPUT_TOKENS_BUCKET_BOUNDARIES,
          });
        }
      },
      onAbort: async ({ steps }) => {
        await emitTurnUsageEvent(steps);
      },
      repairToolCall: async ({
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

        if (
          error instanceof AiException &&
          error.code === AiExceptionCode.STREAM_INTERRUPTED
        ) {
          return;
        }

        if (NoOutputGeneratedError.isInstance(error)) {
          return;
        }

        this.exceptionHandlerService.captureExceptions([error]);
      });

    return {
      stream,
      modelConfig,
      hasNoMoreAvailableCredits: () => hasNoMoreAvailableCredits,
      getStreamError: () => lastUnderlyingStreamError,
    };
  }

  private sanitizeMessagePartsForModel(
    messages: ExtendedUIMessage[],
    directlyCallableToolNames: Set<string>,
  ): ExtendedUIMessage[] {
    return messages.map((message) => ({
      ...message,
      parts: guideUncallableToolCallsToMetaTool(
        finalizeDanglingToolParts(message.parts),
        directlyCallableToolNames,
      ),
    }));
  }

  private injectBrowsingContextIntoLastUserMessage(
    messages: ExtendedUIMessage[],
    contextString: string,
  ): ExtendedUIMessage[] {
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
    switch (browsingContext.type) {
      case 'recordPage':
        return this.buildRecordPageContext(
          workspace,
          browsingContext.objectNameSingular,
          browsingContext.recordId,
          browsingContext.pageLayoutId,
          browsingContext.activeTabId,
        );
      case 'listView':
        return this.buildListViewContext(browsingContext);
      default:
        // browsing context comes from unvalidated client JSON
        return '';
    }
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
}
