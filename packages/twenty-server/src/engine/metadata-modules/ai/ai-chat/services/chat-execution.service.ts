import { Injectable, Logger } from '@nestjs/common';

import { anthropic } from '@ai-sdk/anthropic';
import { groq } from '@ai-sdk/groq';
import { openai } from '@ai-sdk/openai';
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type SystemModelMessage,
  type ToolSet,
  type UIDataTypes,
  type UIMessage,
  type UITools,
} from 'ai';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';

import { type CodeExecutionStreamEmitter } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';

import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { COMMON_PRELOAD_TOOLS } from 'src/engine/core-modules/tool-provider/constants/common-preload-tools.const';
import { wrapToolsWithOutputSerialization } from 'src/engine/core-modules/tool-provider/output-serialization/wrap-tools-with-output-serialization.util';
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
import { AIBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { SystemPromptBuilderService } from 'src/engine/metadata-modules/ai/ai-chat/services/system-prompt-builder.service';
import {
  extractCodeInterpreterFiles,
  type ExtractedFile,
} from 'src/engine/metadata-modules/ai/ai-chat/utils/extract-code-interpreter-files.util';
import {
  type AIModelConfig,
  ModelProvider,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-models.const';
import { AI_TELEMETRY_CONFIG } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-telemetry.const';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { SkillService } from 'src/engine/metadata-modules/skill/skill.service';

export type ChatExecutionOptions = {
  workspace: WorkspaceEntity;
  userWorkspaceId: string;
  messages: UIMessage<unknown, UIDataTypes, UITools>[];
  browsingContext: BrowsingContextType | null;
  onCodeExecutionUpdate?: CodeExecutionStreamEmitter;
};

export type ChatExecutionResult = {
  stream: ReturnType<typeof streamText>;
  modelConfig: AIModelConfig;
};

@Injectable()
export class ChatExecutionService {
  private readonly logger = new Logger(ChatExecutionService.name);

  constructor(
    private readonly toolRegistry: ToolRegistryService,
    private readonly skillService: SkillService,
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly aiBillingService: AIBillingService,
    private readonly agentActorContextService: AgentActorContextService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    private readonly systemPromptBuilder: SystemPromptBuilderService,
  ) {}

  async streamChat({
    workspace,
    userWorkspaceId,
    messages,
    browsingContext,
    onCodeExecutionUpdate,
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

    const preloadedTools = await this.toolRegistry.getToolsByName(
      COMMON_PRELOAD_TOOLS,
      toolContext,
    );

    const preloadedToolNames = Object.keys(preloadedTools);

    // Respect the workspace's model preference (Settings > AI > Model Router)
    const registeredModel =
      await this.aiModelRegistryService.resolveModelForAgent({
        modelId: workspace.smartModel,
      });

    const modelConfig = this.aiModelRegistryService.getEffectiveModelConfig(
      registeredModel.modelId,
    );

    // Direct tools: native provider tools + preloaded tools.
    // These are callable directly AND as fallback through execute_tool.
    const directTools: ToolSet = {
      ...wrapToolsWithOutputSerialization(preloadedTools),
      ...this.getNativeWebSearchTool(registeredModel.provider),
    };

    // ToolSet is constant for the entire conversation — no mutation.
    // learn_tools returns schemas as text; execute_tool dispatches to cached tools.
    const activeTools: ToolSet = {
      ...directTools,
      [LEARN_TOOLS_TOOL_NAME]: createLearnToolsTool(
        this.toolRegistry,
        toolContext,
      ),
      [EXECUTE_TOOL_TOOL_NAME]: createExecuteToolTool(
        this.toolRegistry,
        toolContext,
        directTools,
      ),
      [LOAD_SKILL_TOOL_NAME]: createLoadSkillTool((skillNames) =>
        this.skillService.findFlatSkillsByNames(skillNames, workspace.id),
      ),
    };

    const { processedMessages, extractedFiles } =
      extractCodeInterpreterFiles(messages);

    let storedFiles: Array<{
      filename: string;
      storagePath: string;
      url: string;
    }> = [];

    if (extractedFiles.length > 0) {
      storedFiles = await this.storeExtractedFiles(
        extractedFiles,
        workspace.id,
      );
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
        registeredModel.provider === ModelProvider.ANTHROPIC
          ? { anthropic: { cacheControl: { type: 'ephemeral' } } }
          : undefined,
    };

    const stream = streamText({
      model: registeredModel.model,
      messages: [systemMessage, ...convertToModelMessages(processedMessages)],
      tools: activeTools,
      stopWhen: stepCountIs(AGENT_CONFIG.MAX_STEPS),
      experimental_telemetry: AI_TELEMETRY_CONFIG,
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

    stream.usage
      .then((usage) => {
        this.aiBillingService.calculateAndBillUsage(
          registeredModel.modelId,
          usage,
          workspace.id,
          null,
        );
      })
      .catch((error) => {
        this.logger.error('Failed to bill usage:', error);
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

  private getNativeWebSearchTool(provider: ModelProvider): ToolSet {
    switch (provider) {
      case ModelProvider.ANTHROPIC:
        return { web_search: anthropic.tools.webSearch_20250305() };
      case ModelProvider.OPENAI:
        return { web_search: openai.tools.webSearch() };
      case ModelProvider.GROQ:
        // Type assertion needed due to @ai-sdk/groq tool type mismatch
        return {
          web_search: groq.tools.browserSearch({}) as ToolSet[string],
        };
      default:
        return {};
    }
  }

  private async storeExtractedFiles(
    files: ExtractedFile[],
    _workspaceId: string,
  ): Promise<Array<{ filename: string; storagePath: string; url: string }>> {
    // Files are already uploaded and have URLs, just return them with their info
    // The code interpreter tool will download them when needed
    return files.map((file) => ({
      filename: file.filename,
      storagePath: file.filename,
      url: file.url,
    }));
  }
}
