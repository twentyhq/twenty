import { Injectable, Logger } from '@nestjs/common';

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
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';

import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

import { type CodeExecutionStreamEmitter } from 'src/engine/core-modules/tool-provider/interfaces/code-execution-stream-emitter.type';

import { CodeInterpreterService } from 'src/engine/core-modules/code-interpreter/code-interpreter.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { COMMON_PRELOAD_TOOLS } from 'src/engine/core-modules/tool-provider/constants/common-preload-tools.const';
import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import {
  createExecuteToolTool,
  createLearnToolsTool,
  createLoadSkillTool,
  EXECUTE_TOOL_TOOL_NAME,
  LEARN_TOOLS_TOOL_NAME,
  LOAD_SKILL_TOOL_NAME,
} from 'src/engine/core-modules/tool-provider/tools';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentActorContextService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-actor-context.service';
import { AGENT_CONFIG } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-config.const';
import { type BrowsingContextType } from 'src/engine/metadata-modules/ai/ai-agent/types/browsingContext.type';
import { repairToolCall } from 'src/engine/metadata-modules/ai/ai-agent/utils/repair-tool-call.util';
import { AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { countNativeWebSearchCallsFromSteps } from 'src/engine/metadata-modules/ai/ai-billing/utils/count-native-web-search-calls-from-steps.util';
import { extractCacheCreationTokensFromSteps } from 'src/engine/metadata-modules/ai/ai-billing/utils/extract-cache-creation-tokens.util';
import { MessagePruningService } from 'src/engine/metadata-modules/ai/ai-chat/services/message-pruning.service';
import { SystemPromptBuilderService } from 'src/engine/metadata-modules/ai/ai-chat/services/system-prompt-builder.service';
import {
  extractCodeInterpreterFiles,
  type ExtractedFile,
} from 'src/engine/metadata-modules/ai/ai-chat/utils/extract-code-interpreter-files.util';
import {
  AI_SDK_ANTHROPIC,
  AI_SDK_BEDROCK,
  AI_SDK_OPENAI,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.const';
import { AI_TELEMETRY_CONFIG } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-telemetry.const';
import {
  AiModelRegistryService,
  type RegisteredAiModel,
} from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { SdkProviderFactoryService } from 'src/engine/metadata-modules/ai/ai-models/services/sdk-provider-factory.service';
import { type AiModelConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-config.type';
import { SkillService } from 'src/engine/metadata-modules/skill/skill.service';

export type ChatExecutionOptions = {
  workspace: WorkspaceEntity;
  userWorkspaceId: string;
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
    private readonly sdkProviderFactory: SdkProviderFactoryService,
    private readonly messagePruningService: MessagePruningService,
  ) {}

  async streamChat({
    workspace,
    userWorkspaceId,
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

    const toolContext = {
      workspaceId: workspace.id,
      roleId,
      actorContext,
      userId,
      userWorkspaceId,
      onCodeExecutionUpdate,
    };

    const contextString = browsingContext
      ? this.buildContextFromBrowsingContext(workspace, browsingContext)
      : undefined;

    const toolCatalog = await this.toolRegistry.buildToolIndex(
      workspace.id,
      roleId,
      { userId, userWorkspaceId },
    );

    const skillCatalog = await this.skillService.findAllFlatSkills(
      workspace.id,
    );

    this.logger.log(
      `Built tool catalog with ${toolCatalog.length} tools, ${skillCatalog.length} skills available`,
    );

    // Preload Exa when the workspace has it enabled; ActionToolProvider
    // only emits the exa_web_search descriptor when isEnabled() is true,
    // so getToolsByName silently skips it otherwise.
    const toolNamesToPreload = [...COMMON_PRELOAD_TOOLS, 'exa_web_search'];

    const preloadedTools = await this.toolRegistry.getToolsByName(
      toolNamesToPreload,
      toolContext,
      { serializeOutput: true },
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

    // Native web_search is returned when the resolved model's SDK provider
    // exposes it (Anthropic, OpenAI). Coexists with exa_web_search when both
    // are available — the model picks based on tool descriptions.
    const { tools: nativeSearchTools, callableToolNames: searchToolNames } =
      this.getNativeWebSearchTools(registeredModel);

    // Tools the model can call directly: preloaded registry tools (already
    // serialized by the hydrator) plus SDK-native tools (opaque, never
    // serialized). execute_tool routes discovered tools through the registry.
    const directTools: ToolSet = {
      ...preloadedTools,
      ...nativeSearchTools,
    };

    const preloadedToolNames = [
      ...Object.keys(preloadedTools),
      ...searchToolNames,
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
        { serializeOutput: true },
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

    let processedMessages: UIMessage[] = messages;

    let storedFiles: Array<{
      filename: string;
      fileId: string;
    }> = [];

    if (this.codeInterpreterService.isEnabled()) {
      const extracted = extractCodeInterpreterFiles(messages);

      processedMessages = extracted.processedMessages;

      if (extracted.extractedFiles.length > 0) {
        storedFiles = await this.storeExtractedFiles(
          extracted.extractedFiles,
          workspace.id,
        );
      }
    }

    const systemPrompt = this.systemPromptBuilder.buildFullPrompt(
      toolCatalog,
      skillCatalog,
      preloadedToolNames,
      contextString,
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
      providerOptions:
        registeredModel.sdkPackage === AI_SDK_ANTHROPIC
          ? { anthropic: { cacheControl: { type: 'ephemeral' } } }
          : registeredModel.sdkPackage === AI_SDK_BEDROCK
            ? { bedrock: { cacheControl: { type: 'ephemeral' } } }
            : undefined,
    };

    const rawModelMessages = await convertToModelMessages(processedMessages);

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

    const billUsageFromSteps = (steps: StepResult<ToolSet>[]) => {
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

      this.aiBillingService.calculateAndBillUsage(
        registeredModel.modelId,
        { usage, cacheCreationTokens },
        workspace.id,
        UsageOperationType.AI_CHAT_TOKEN,
        null,
        userWorkspaceId,
      );

      // billNativeWebSearchUsage short-circuits when count <= 0, so calling
      // unconditionally is safe regardless of whether native search fired.
      this.aiBillingService.billNativeWebSearchUsage(
        countNativeWebSearchCallsFromSteps(steps),
        workspace.id,
        userWorkspaceId,
      );
    };

    const stream = streamText({
      model: registeredModel.model,
      messages: [systemMessage, ...modelMessages],
      tools: activeTools,
      abortSignal,
      stopWhen: stepCountIs(AGENT_CONFIG.MAX_STEPS),
      experimental_telemetry: AI_TELEMETRY_CONFIG,
      onAbort: ({ steps }) => {
        billUsageFromSteps(steps);
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
        });
      },
    });

    Promise.all([stream.usage, stream.steps])
      .then(([, steps]) => {
        billUsageFromSteps(steps);
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
    };
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

  private getNativeWebSearchTools(model: RegisteredAiModel): {
    tools: ToolSet;
    callableToolNames: string[];
  } {
    const empty = { tools: {}, callableToolNames: [] };
    const providerName = model.providerName;

    if (!providerName) {
      return empty;
    }

    switch (model.sdkPackage) {
      case AI_SDK_ANTHROPIC: {
        const provider =
          this.sdkProviderFactory.getRawAnthropicProvider(providerName);

        if (!provider) {
          return empty;
        }

        return {
          tools: { web_search: provider.tools.webSearch_20250305() },
          callableToolNames: ['web_search'],
        };
      }
      case AI_SDK_BEDROCK:
        return empty;
      case AI_SDK_OPENAI: {
        const provider =
          this.sdkProviderFactory.getRawOpenAIProvider(providerName);

        if (!provider) {
          return empty;
        }

        return {
          tools: { web_search: provider.tools.webSearch() },
          callableToolNames: ['web_search'],
        };
      }
      default:
        return empty;
    }
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
