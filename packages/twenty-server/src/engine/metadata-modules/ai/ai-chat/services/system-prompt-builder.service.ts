import { Injectable } from '@nestjs/common';

import { type AiChatAssistantProfile } from 'twenty-shared/ai';
import { FeatureFlagKey } from 'twenty-shared/types';

import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { AgentActorContextService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-actor-context.service';
import { AI_CHAT_EXCLUDED_TOOL_NAMES } from 'src/engine/metadata-modules/ai/ai-chat/constants/ai-chat-excluded-tool-names.const';
import { AI_CHAT_TOOL_NAMES_TO_PRELOAD } from 'src/engine/metadata-modules/ai/ai-chat/constants/ai-chat-tool-names-to-preload.const';
import { buildSystemPromptSections } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-system-prompt-sections.util';
import { type SystemPromptSection } from 'src/engine/metadata-modules/ai/ai-chat/types/system-prompt-section.type';
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

  async buildPreview({
    workspaceId,
    userWorkspaceId,
    workspaceInstructions,
    assistantProfile,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    workspaceInstructions?: string;
    assistantProfile: Pick<AiChatAssistantProfile, 'displayName'>;
  }): Promise<SystemPromptPreview> {
    const { userId, userContext } =
      await this.agentActorContextService.buildUserAndAgentActorContext(
        userWorkspaceId,
        workspaceId,
      );

    const [toolCatalog, skillCatalog, isAiChatInboxEnabled] = await Promise.all(
      [
        this.toolRegistry.buildToolIndex(workspaceId, {
          authContext: getWorkspaceAuthContext(),
          userId,
          userWorkspaceId,
          excludeTools: AI_CHAT_EXCLUDED_TOOL_NAMES,
        }),
        this.skillService.findAllFlatSkills(workspaceId),
        this.featureFlagService.isFeatureEnabled(
          FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
          workspaceId,
        ),
      ],
    );

    const sections = buildSystemPromptSections({
      assistantDisplayName: isAiChatInboxEnabled
        ? assistantProfile.displayName
        : undefined,
      toolCatalog,
      skillCatalog,
      preloadedTools: AI_CHAT_TOOL_NAMES_TO_PRELOAD,
      workspaceInstructions,
      userContext,
      userWorkspaceId,
      workspaceId,
      canAttachConversationToRecords: isAiChatInboxEnabled,
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
