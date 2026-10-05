import { Injectable } from '@nestjs/common';

import { FeatureFlagKey } from 'twenty-shared/types';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { AgentActorContextService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-actor-context.service';
import { AI_CHAT_EXCLUDED_TOOL_NAMES } from 'src/engine/metadata-modules/ai/ai-chat/constants/ai-chat-excluded-tool-names.const';
import { AI_CHAT_TOOL_NAMES_TO_PRELOAD } from 'src/engine/metadata-modules/ai/ai-chat/constants/ai-chat-tool-names-to-preload.const';
import {
  buildSystemPromptSections,
  type SystemPromptSection,
} from 'src/engine/metadata-modules/ai/ai-chat/utils/build-full-system-prompt.util';
import { SkillService } from 'src/engine/metadata-modules/skill/skill.service';

type SystemPromptPreview = {
  sections: (SystemPromptSection & { estimatedTokenCount: number })[];
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
    private readonly featureFlagService: FeatureFlagService,
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

    const [toolCatalog, skillCatalog, canAttachConversationToRecords] =
      await Promise.all([
        this.toolRegistry.buildToolIndex(workspaceId, roleId, {
          userId,
          userWorkspaceId,
          excludeTools: AI_CHAT_EXCLUDED_TOOL_NAMES,
        }),
        this.skillService.findAllFlatSkills(workspaceId),
        this.featureFlagService.isFeatureEnabled(
          FeatureFlagKey.IS_CONVERSATIONS_TAB_ENABLED,
          workspaceId,
        ),
      ]);

    const sections = buildSystemPromptSections({
      toolCatalog,
      skillCatalog,
      preloadedTools: AI_CHAT_TOOL_NAMES_TO_PRELOAD,
      workspaceInstructions,
      userContext,
      userWorkspaceId,
      canAttachConversationToRecords,
    }).map((section) => ({
      ...section,
      estimatedTokenCount: estimateTokenCount(section.content),
    }));

    return {
      sections,
      estimatedTokenCount: sections.reduce(
        (sum, section) => sum + section.estimatedTokenCount,
        0,
      ),
    };
  }
}
