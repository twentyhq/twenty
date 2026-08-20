import { isNonEmptyString } from '@sniptt/guards';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { buildToolCatalogSection } from 'src/engine/core-modules/tool-provider/utils/build-tool-catalog-section.util';
import { type UserContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-actor-context.service';
import { CHAT_SYSTEM_PROMPTS } from 'src/engine/metadata-modules/ai/ai-chat/constants/chat-system-prompts.const';
import { WORKSPACE_SETUP_SYSTEM_PROMPT } from 'src/engine/metadata-modules/ai/ai-chat/constants/workspace-setup-system-prompt.constant';
import { buildSkillCatalogSection } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-skill-catalog-section.util';
import { buildUploadedFilesSection } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-uploaded-files-section.util';
import { buildUserContextSection } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-user-context-section.util';
import { buildWorkspaceInstructionsSection } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-workspace-instructions-section.util';
import { type FlatSkill } from 'src/engine/metadata-modules/flat-skill/types/flat-skill.type';

export const buildFullSystemPrompt = ({
  toolCatalog,
  skillCatalog,
  preloadedTools,
  storedFiles,
  workspaceInstructions,
  userContext,
  isWorkspaceSetupThread,
}: {
  toolCatalog: ToolIndexEntry[];
  skillCatalog: FlatSkill[];
  preloadedTools: string[];
  storedFiles?: Array<{
    filename: string;
    fileId: string;
  }>;
  workspaceInstructions?: string;
  userContext?: UserContext;
  isWorkspaceSetupThread?: boolean;
}): string => {
  const parts: string[] = isWorkspaceSetupThread
    ? [WORKSPACE_SETUP_SYSTEM_PROMPT, CHAT_SYSTEM_PROMPTS.RESPONSE_FORMAT]
    : [
        CHAT_SYSTEM_PROMPTS.BASE,
        CHAT_SYSTEM_PROMPTS.BROWSING_CONTEXT_INSTRUCTION,
        CHAT_SYSTEM_PROMPTS.RESPONSE_FORMAT,
      ];

  if (!isWorkspaceSetupThread) {
    const workspaceInstructionsSection = buildWorkspaceInstructionsSection(
      workspaceInstructions ?? '',
    );

    if (isNonEmptyString(workspaceInstructionsSection)) {
      parts.push(workspaceInstructionsSection);
    }
  }

  if (userContext) {
    parts.push(buildUserContextSection(userContext));
  }

  parts.push(buildToolCatalogSection(toolCatalog, preloadedTools));

  const skillSection = buildSkillCatalogSection(skillCatalog);

  if (skillSection) {
    parts.push(skillSection);
  }

  if (isNonEmptyArray(storedFiles)) {
    parts.push(buildUploadedFilesSection(storedFiles));
  }

  return parts.join('\n');
};
