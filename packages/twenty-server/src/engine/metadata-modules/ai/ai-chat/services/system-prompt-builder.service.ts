import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';

import { COMMON_PRELOAD_TOOLS } from 'src/engine/core-modules/tool-provider/constants/common-preload-tools.const';
import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { buildToolCatalogSection } from 'src/engine/core-modules/tool-provider/utils/build-tool-catalog-section.util';
import { AgentActorContextService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-actor-context.service';
import { CHAT_SYSTEM_PROMPTS } from 'src/engine/metadata-modules/ai/ai-chat/constants/chat-system-prompts.const';
import { buildSkillCatalogSection } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-skill-catalog-section.util';
import { buildUserContextSection } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-user-context-section.util';
import { buildWorkspaceInstructionsSection } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-workspace-instructions-section.util';
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

    const workspaceSection = buildWorkspaceInstructionsSection(
      workspaceInstructions ?? '',
    );

    if (isNonEmptyString(workspaceSection)) {
      sections.push({
        title: 'Workspace Instructions',
        content: workspaceSection,
        estimatedTokenCount: estimateTokenCount(workspaceSection),
      });
    }

    if (userContext) {
      const userSection = buildUserContextSection(userContext);

      sections.push({
        title: 'User Context',
        content: userSection,
        estimatedTokenCount: estimateTokenCount(userSection),
      });
    }

    const toolSection = buildToolCatalogSection(
      toolCatalog,
      COMMON_PRELOAD_TOOLS,
    );

    sections.push({
      title: 'Tool Catalog',
      content: toolSection,
      estimatedTokenCount: estimateTokenCount(toolSection),
    });

    const skillSection = buildSkillCatalogSection(skillCatalog);

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
}
