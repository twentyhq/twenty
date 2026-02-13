import { Injectable } from '@nestjs/common';

import { COMMON_PRELOAD_TOOLS } from 'src/engine/core-modules/tool-provider/constants/common-preload-tools.const';
import { ToolCategory } from 'src/engine/core-modules/tool-provider/enums/tool-category.enum';
import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import {
  EXECUTE_TOOL_TOOL_NAME,
  LEARN_TOOLS_TOOL_NAME,
  LOAD_SKILL_TOOL_NAME,
} from 'src/engine/core-modules/tool-provider/tools';
import {
  AgentActorContextService,
  type UserContext,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-actor-context.service';
import { CHAT_SYSTEM_PROMPTS } from 'src/engine/metadata-modules/ai/ai-chat/constants/chat-system-prompts.const';
import { type FlatSkill } from 'src/engine/metadata-modules/flat-skill/types/flat-skill.type';
import { SkillService } from 'src/engine/metadata-modules/skill/skill.service';

export type SystemPromptSection = {
  title: string;
  content: string;
  estimatedTokenCount: number;
};

export type SystemPromptPreview = {
  sections: SystemPromptSection[];
  estimatedTokenCount: number;
};

// ~4 characters per token for mixed English/code content
const estimateTokenCount = (text: string): number => Math.ceil(text.length / 4);

@Injectable()
export class SystemPromptBuilderService {
  constructor(
    private readonly toolRegistry: ToolRegistryService,
    private readonly skillService: SkillService,
    private readonly agentActorContextService: AgentActorContextService,
  ) {}

  async buildPreview(
    workspaceId: string,
    userWorkspaceId: string,
    workspaceInstructions?: string,
  ): Promise<SystemPromptPreview> {
    const { roleId, userId, userContext } =
      await this.agentActorContextService.buildUserAndAgentActorContext(
        userWorkspaceId,
        workspaceId,
      );

    const toolCatalog = await this.toolRegistry.buildToolIndex(
      workspaceId,
      roleId,
      { userId, userWorkspaceId },
    );

    const skillCatalog = await this.skillService.findAllFlatSkills(workspaceId);

    const sections: SystemPromptSection[] = [];

    const baseContent = CHAT_SYSTEM_PROMPTS.BASE;

    sections.push({
      title: 'Base Instructions',
      content: baseContent,
      estimatedTokenCount: estimateTokenCount(baseContent),
    });

    const responseFormatContent = CHAT_SYSTEM_PROMPTS.RESPONSE_FORMAT;

    sections.push({
      title: 'Response Format',
      content: responseFormatContent,
      estimatedTokenCount: estimateTokenCount(responseFormatContent),
    });

    if (workspaceInstructions) {
      const workspaceSection = this.buildWorkspaceInstructionsSection(
        workspaceInstructions,
      );

      sections.push({
        title: 'Workspace Instructions',
        content: workspaceSection,
        estimatedTokenCount: estimateTokenCount(workspaceSection),
      });
    }

    if (userContext) {
      const userSection = this.buildUserContextSection(userContext);

      sections.push({
        title: 'User Context',
        content: userSection,
        estimatedTokenCount: estimateTokenCount(userSection),
      });
    }

    const toolSection = this.buildToolCatalogSection(
      toolCatalog,
      COMMON_PRELOAD_TOOLS,
    );

    sections.push({
      title: 'Tool Catalog',
      content: toolSection,
      estimatedTokenCount: estimateTokenCount(toolSection),
    });

    const skillSection = this.buildSkillCatalogSection(skillCatalog);

    if (skillSection) {
      sections.push({
        title: 'Skill Catalog',
        content: skillSection,
        estimatedTokenCount: estimateTokenCount(skillSection),
      });
    }

    const totalTokens = sections.reduce(
      (sum, section) => sum + section.estimatedTokenCount,
      0,
    );

    return {
      sections,
      estimatedTokenCount: totalTokens,
    };
  }

  buildFullPrompt(
    toolCatalog: ToolIndexEntry[],
    skillCatalog: FlatSkill[],
    preloadedTools: string[],
    contextString?: string,
    storedFiles?: Array<{
      filename: string;
      storagePath: string;
      url: string;
    }>,
    workspaceInstructions?: string,
    userContext?: UserContext,
  ): string {
    const parts: string[] = [
      CHAT_SYSTEM_PROMPTS.BASE,
      CHAT_SYSTEM_PROMPTS.RESPONSE_FORMAT,
    ];

    if (workspaceInstructions) {
      parts.push(this.buildWorkspaceInstructionsSection(workspaceInstructions));
    }

    if (userContext) {
      parts.push(this.buildUserContextSection(userContext));
    }

    parts.push(this.buildToolCatalogSection(toolCatalog, preloadedTools));
    parts.push(this.buildSkillCatalogSection(skillCatalog));

    if (storedFiles && storedFiles.length > 0) {
      parts.push(this.buildUploadedFilesSection(storedFiles));
    }

    if (contextString) {
      parts.push(
        `\nCONTEXT (what the user is currently viewing):\n${contextString}`,
      );
    }

    return parts.join('\n');
  }

  buildWorkspaceInstructionsSection(instructions: string): string {
    return `
## Workspace Instructions

The following are custom instructions provided by the workspace administrator:

${instructions}`;
  }

  buildUserContextSection(userContext: UserContext): string {
    const parts = [
      `User: ${userContext.firstName} ${userContext.lastName}`.trim(),
      `Locale: ${userContext.locale}`,
    ];

    if (userContext.timezone) {
      parts.push(`Timezone: ${userContext.timezone}`);
    }

    return `
## User Context

${parts.join('\n')}`;
  }

  buildUploadedFilesSection(
    storedFiles: Array<{ filename: string; storagePath: string; url: string }>,
  ): string {
    const fileList = storedFiles.map((f) => `- ${f.filename}`).join('\n');

    const filesJson = JSON.stringify(
      storedFiles.map((f) => ({ filename: f.filename, url: f.url })),
    );

    return `
## Uploaded Files

The user has uploaded the following files:
${fileList}

**IMPORTANT**: Use the \`code_interpreter\` tool to analyze these files.
When calling code_interpreter, include the files parameter with these values:
\`\`\`json
${filesJson}
\`\`\`

In your Python code, access files at \`/home/user/{filename}\`.`;
  }

  buildSkillCatalogSection(skillCatalog: FlatSkill[]): string {
    if (skillCatalog.length === 0) {
      return '';
    }

    const skillsList = skillCatalog
      .map(
        (skill) => `- \`${skill.name}\`: ${skill.description ?? skill.label}`,
      )
      .join('\n');

    return `
## Available Skills

Skills provide detailed expertise for specialized tasks. Load a skill before attempting complex operations.
To load a skill, call \`${LOAD_SKILL_TOOL_NAME}\` with the skill name(s).

${skillsList}`;
  }

  buildToolCatalogSection(
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
To use any other tool, first call \`${LEARN_TOOLS_TOOL_NAME}\` to learn its schema, then call \`${EXECUTE_TOOL_TOOL_NAME}\` to run it.

### Pre-loaded Tools (ready to use now)
- \`web_search\` ✓: Search the web for real-time information (ALWAYS use this for current data, news, research)
${preloadedTools.length > 0 ? preloadedTools.map((toolName) => `- \`${toolName}\` ✓`).join('\n') : ''}

### Tool Catalog by Category`);

    const categoryOrder = [
      ToolCategory.DATABASE_CRUD,
      ToolCategory.ACTION,
      ToolCategory.WORKFLOW,
      ToolCategory.DASHBOARD,
      ToolCategory.METADATA,
      ToolCategory.VIEW,
      ToolCategory.LOGIC_FUNCTION,
    ];

    for (const category of categoryOrder) {
      const tools = toolsByCategory.get(category);

      if (!tools || tools.length === 0) {
        continue;
      }

      const categoryLabel = this.getCategoryLabel(category);

      sections.push(`
#### ${categoryLabel} (${tools.length} tools)
${tools
  .map((tool) => {
    const status = preloadedSet.has(tool.name) ? ' ✓' : '';

    return `- \`${tool.name}\`${status}`;
  })
  .join('\n')}`);
    }

    sections.push(`
### How to Use Tools
1. **Web search** (\`web_search\`): Use for ANY request requiring current/real-time information from the internet
2. **Pre-loaded tools** (marked with ✓): Use directly
3. **Other tools**: First call \`${LEARN_TOOLS_TOOL_NAME}({toolNames: ["tool_name"]})\` to learn the schema, then call \`${EXECUTE_TOOL_TOOL_NAME}({toolName: "tool_name", arguments: {...}})\` to run it`);

    return sections.join('\n');
  }

  private getCategoryLabel(category: string): string {
    switch (category) {
      case ToolCategory.DATABASE_CRUD:
        return 'Database Tools (CRUD operations)';
      case ToolCategory.ACTION:
        return 'Action Tools (HTTP, Email, etc.)';
      case ToolCategory.WORKFLOW:
        return 'Workflow Tools (create/manage workflows)';
      case ToolCategory.METADATA:
        return 'Metadata Tools (schema management)';
      case ToolCategory.VIEW:
        return 'View Tools (query views)';
      case ToolCategory.DASHBOARD:
        return 'Dashboard Tools (create/manage dashboards)';
      case ToolCategory.LOGIC_FUNCTION:
        return 'Logic Functions (custom tools)';
      default:
        return category;
    }
  }
}
