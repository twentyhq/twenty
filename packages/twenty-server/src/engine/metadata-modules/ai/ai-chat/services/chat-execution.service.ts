import { Injectable, Logger } from '@nestjs/common';

import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type ToolSet,
  type UIDataTypes,
  type UIMessage,
  type UITools,
} from 'ai';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { getAllSelectableColumnNames } from 'src/engine/api/utils/get-all-selectable-column-names.utils';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import {
  type ToolIndexEntry,
  ToolRegistryService,
} from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import {
  AGENT_SEARCH_TOOL_NAME,
  createAgentSearchTool,
  createLoadToolsTool,
  type DynamicToolStore,
  LOAD_TOOLS_TOOL_NAME,
} from 'src/engine/core-modules/tool-provider/tools';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentActorContextService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-actor-context.service';
import {
  AgentException,
  AgentExceptionCode,
} from 'src/engine/metadata-modules/ai/ai-agent/agent.exception';
import { AgentService } from 'src/engine/metadata-modules/ai/ai-agent/agent.service';
import { AGENT_CONFIG } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-config.const';
import { type AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { type RecordIdsByObjectMetadataNameSingularType } from 'src/engine/metadata-modules/ai/ai-agent/types/recordIdsByObjectMetadataNameSingular.type';
import { repairToolCall } from 'src/engine/metadata-modules/ai/ai-agent/utils/repair-tool-call.util';
import { AIBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { CHAT_SYSTEM_PROMPTS } from 'src/engine/metadata-modules/ai/ai-chat/constants/chat-system-prompts.const';
import { ModelProvider } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-models.const';
import { AI_TELEMETRY_CONFIG } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-telemetry.const';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

export type ChatExecutionOptions = {
  workspace: WorkspaceEntity;
  userWorkspaceId: string;
  messages: UIMessage<unknown, UIDataTypes, UITools>[];
  recordIdsByObjectMetadataNameSingular: RecordIdsByObjectMetadataNameSingularType;
};

export type ChatExecutionResult = {
  stream: ReturnType<typeof streamText>;
  preloadedTools: string[];
  initialAgents: string[];
};

const INITIAL_AGENTS_LIMIT = 2;

// Common tools to pre-load for quick access
const COMMON_PRELOAD_TOOLS = ['http_request', 'search_articles'];

@Injectable()
export class ChatExecutionService {
  private readonly logger = new Logger(ChatExecutionService.name);

  constructor(
    private readonly toolRegistry: ToolRegistryService,
    private readonly agentService: AgentService,
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly aiBillingService: AIBillingService,
    private readonly agentActorContextService: AgentActorContextService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
  ) {}

  async streamChat({
    workspace,
    userWorkspaceId,
    messages,
    recordIdsByObjectMetadataNameSingular,
  }: ChatExecutionOptions): Promise<ChatExecutionResult> {
    const { actorContext, roleId } =
      await this.agentActorContextService.buildUserAndAgentActorContext(
        userWorkspaceId,
        workspace.id,
      );

    const toolContext = { workspaceId: workspace.id, roleId, actorContext };

    const lastUserMessage = this.getLastUserMessage(messages);

    let recordContext: string | undefined;

    if (recordIdsByObjectMetadataNameSingular.length > 0) {
      recordContext = await this.buildContextFromRecords(
        workspace,
        recordIdsByObjectMetadataNameSingular,
        userWorkspaceId,
      );
    }

    const [toolCatalog, initialAgents] = await Promise.all([
      this.toolRegistry.buildToolIndex(workspace.id, roleId),
      this.agentService.searchAgents(lastUserMessage, workspace.id, {
        limit: INITIAL_AGENTS_LIMIT,
      }),
    ]);

    this.logger.log(
      `Built tool catalog with ${toolCatalog.length} tools, ${initialAgents.length} agents`,
    );

    const preloadedTools = await this.toolRegistry.getToolsByName(
      COMMON_PRELOAD_TOOLS,
      toolContext,
    );

    const preloadedToolNames = Object.keys(preloadedTools);

    const dynamicToolStore: DynamicToolStore = {
      loadedTools: new Set(preloadedToolNames),
    };

    const registeredModel =
      this.aiModelRegistryService.getDefaultPerformanceModel();

    const activeTools: ToolSet = {
      ...preloadedTools,
      ...this.getNativeWebSearchTool(registeredModel.provider),
      [LOAD_TOOLS_TOOL_NAME]: createLoadToolsTool(
        this.toolRegistry,
        toolContext,
        dynamicToolStore,
        async (toolNames) => {
          const newTools = await this.toolRegistry.getToolsByName(
            toolNames,
            toolContext,
          );

          Object.assign(activeTools, newTools);
          this.logger.log(`Dynamically loaded tools: ${toolNames.join(', ')}`);
        },
      ),
      [AGENT_SEARCH_TOOL_NAME]: createAgentSearchTool((query, options) =>
        this.agentService.searchAgents(query, workspace.id, options),
      ),
    };

    const systemPrompt = this.buildSystemPrompt(
      toolCatalog,
      initialAgents,
      preloadedToolNames,
      recordContext,
    );

    this.logger.log(
      `Starting chat execution with model ${registeredModel.modelId}, ${Object.keys(activeTools).length} active tools`,
    );

    const stream = streamText({
      model: registeredModel.model,
      system: systemPrompt,
      messages: convertToModelMessages(messages),
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
      preloadedTools: preloadedToolNames,
      initialAgents: initialAgents.map((a) => a.name),
    };
  }

  private async buildContextFromRecords(
    workspace: WorkspaceEntity,
    recordIdsByObjectMetadataNameSingular: RecordIdsByObjectMetadataNameSingularType,
    userWorkspaceId: string,
  ): Promise<string> {
    const { userWorkspaceRoleMap } =
      await this.workspaceCacheService.getOrRecompute(workspace.id, [
        'userWorkspaceRoleMap',
      ]);

    const roleId = userWorkspaceRoleMap[userWorkspaceId];

    if (!roleId) {
      throw new AgentException(
        'Failed to retrieve user role.',
        AgentExceptionCode.ROLE_NOT_FOUND,
      );
    }

    const workspaceDataSource =
      await this.twentyORMGlobalManager.getDataSourceForWorkspace({
        workspaceId: workspace.id,
      });

    const flatObjectMetadataMaps =
      workspaceDataSource.internalContext.flatObjectMetadataMaps;
    const flatFieldMetadataMaps =
      workspaceDataSource.internalContext.flatFieldMetadataMaps;
    const objectIdByNameSingular =
      workspaceDataSource.internalContext.objectIdByNameSingular;
    const objectMetadataPermissions = workspaceDataSource.permissionsPerRoleId;

    const contextObject = (
      await Promise.all(
        recordIdsByObjectMetadataNameSingular.map(
          async (recordsWithObjectMetadataNameSingular) => {
            if (recordsWithObjectMetadataNameSingular.recordIds.length === 0) {
              return [];
            }

            const objectMetadataId =
              objectIdByNameSingular[
                recordsWithObjectMetadataNameSingular.objectMetadataNameSingular
              ];
            const objectMetadataMapItem = objectMetadataId
              ? flatObjectMetadataMaps.byId[objectMetadataId]
              : undefined;

            if (!objectMetadataMapItem) {
              this.logger.warn(
                `Object metadata not found for ${recordsWithObjectMetadataNameSingular.objectMetadataNameSingular}`,
              );

              return [];
            }

            const repository = workspaceDataSource.getRepository(
              recordsWithObjectMetadataNameSingular.objectMetadataNameSingular,
              { unionOf: [roleId] },
            );

            const restrictedFields =
              objectMetadataPermissions?.[roleId]?.[objectMetadataMapItem.id]
                ?.restrictedFields ?? {};

            const hasRestrictedFields = Object.values(restrictedFields).some(
              (field) => field.canRead === false,
            );

            const selectOptions = hasRestrictedFields
              ? getAllSelectableColumnNames({
                  restrictedFields,
                  objectMetadata: {
                    objectMetadataMapItem,
                    flatFieldMetadataMaps,
                  },
                })
              : undefined;

            return (
              await repository.find({
                ...(selectOptions && { select: selectOptions }),
                where: {
                  id: In(recordsWithObjectMetadataNameSingular.recordIds),
                },
              })
            ).map((record) => {
              return {
                ...record,
                resourceUrl: this.workspaceDomainsService.buildWorkspaceURL({
                  workspace,
                  pathname: getAppPath(AppPath.RecordShowPage, {
                    objectNameSingular:
                      recordsWithObjectMetadataNameSingular.objectMetadataNameSingular,
                    objectRecordId: record.id,
                  }),
                }),
              };
            });
          },
        ),
      )
    ).flat(2);

    return JSON.stringify(contextObject);
  }

  private getLastUserMessage(
    messages: UIMessage<unknown, UIDataTypes, UITools>[],
  ): string {
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];

      if (message.role === 'user') {
        const textPart = message.parts.find((part) => part.type === 'text');

        if (textPart && 'text' in textPart) {
          return textPart.text;
        }
      }
    }

    return '';
  }

  private buildSystemPrompt(
    toolCatalog: ToolIndexEntry[],
    agents: AgentEntity[],
    preloadedTools: string[],
    recordContext?: string,
  ): string {
    const parts: string[] = [
      CHAT_SYSTEM_PROMPTS.BASE,
      CHAT_SYSTEM_PROMPTS.RESPONSE_FORMAT,
    ];

    if (agents.length > 0) {
      const skillsSection = agents
        .map((agent) => `## ${agent.label} Expertise\n${agent.prompt}`)
        .join('\n\n');

      parts.push(`\nYou have the following expertise:\n\n${skillsSection}`);
    }

    parts.push(this.buildToolCatalogSection(toolCatalog, preloadedTools));

    if (recordContext) {
      parts.push(
        `\nCONTEXT (records the user is currently viewing):\n${recordContext}`,
      );
    }

    return parts.join('\n');
  }

  private buildToolCatalogSection(
    toolCatalog: ToolIndexEntry[],
    preloadedTools: string[],
  ): string {
    const preloadedSet = new Set(preloadedTools);

    const toolsByCategory = new Map<string, ToolIndexEntry[]>();

    for (const tool of toolCatalog) {
      const category = tool.category;
      const existing = toolsByCategory.get(category) ?? [];

      existing.push(tool);
      toolsByCategory.set(category, existing);
    }

    const sections: string[] = [];

    sections.push(`
## Available Tools

You have access to ${toolCatalog.length} tools plus native web search. Some are pre-loaded and ready to use immediately.
To use a tool that isn't pre-loaded, call \`${LOAD_TOOLS_TOOL_NAME}\` with the exact tool name(s) first.

### Pre-loaded Tools (ready to use now)
- \`web_search\` ✓: Search the web for real-time information (ALWAYS use this for current data, news, research)
${preloadedTools.length > 0 ? preloadedTools.map((t) => `- \`${t}\` ✓`).join('\n') : ''}

### Tool Catalog by Category`);

    const categoryOrder = ['database', 'action', 'workflow', 'metadata'];

    for (const category of categoryOrder) {
      const tools = toolsByCategory.get(category);

      if (!tools || tools.length === 0) {
        continue;
      }

      const categoryLabel = this.getCategoryLabel(category);

      sections.push(`
#### ${categoryLabel} (${tools.length} tools)
${tools
  .map((t) => {
    const status = preloadedSet.has(t.name) ? ' ✓' : '';

    return `- \`${t.name}\`${status}: ${t.description}`;
  })
  .join('\n')}`);
    }

    sections.push(`
### How to Use Tools
1. **Web search** (\`web_search\`): Use for ANY request requiring current/real-time information from the internet
2. **Pre-loaded tools** (marked with ✓): Use directly
3. **Other tools**: First call \`${LOAD_TOOLS_TOOL_NAME}({toolNames: ["tool_name"]})\`, then use the tool
4. **Agent expertise**: Call \`${AGENT_SEARCH_TOOL_NAME}\` to load specialized knowledge for workflows, etc.`);

    return sections.join('\n');
  }

  private getCategoryLabel(category: string): string {
    switch (category) {
      case 'database':
        return 'Database Tools (CRUD operations)';
      case 'action':
        return 'Action Tools (HTTP, Email, etc.)';
      case 'workflow':
        return 'Workflow Tools (create/manage workflows)';
      case 'metadata':
        return 'Metadata Tools (schema management)';
      default:
        return category;
    }
  }

  private getNativeWebSearchTool(provider: ModelProvider): ToolSet {
    switch (provider) {
      case ModelProvider.ANTHROPIC:
        return { web_search: anthropic.tools.webSearch_20250305() };
      case ModelProvider.OPENAI:
        return { web_search: openai.tools.webSearch() };
      default:
        // Other providers don't have native web search
        return {};
    }
  }
}
