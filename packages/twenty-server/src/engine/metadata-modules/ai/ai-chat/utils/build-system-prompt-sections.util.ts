import {
  DEFAULT_AI_CHAT_ASSISTANT_PROFILE,
  PREVIEW_FRONT_COMPONENT_TOOL_NAME,
} from 'twenty-shared/ai';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { buildToolCatalogSection } from 'src/engine/core-modules/tool-provider/utils/build-tool-catalog-section.util';
import { CHAT_SYSTEM_PROMPTS } from 'src/engine/metadata-modules/ai/ai-chat/constants/chat-system-prompts.const';
import { buildReferencedSkillsSection } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-referenced-skills-section.util';
import { buildSkillCatalogSection } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-skill-catalog-section.util';
import { buildUploadedFilesSection } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-uploaded-files-section.util';
import { buildUserContextSection } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-user-context-section.util';
import { buildWorkspaceInstructionsSection } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-workspace-instructions-section.util';
import { getWorkspaceSetupSystemPrompt } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-workspace-setup-system-prompt.util';

import { type SystemPromptSection } from 'src/engine/metadata-modules/ai/ai-chat/types/system-prompt-section.type';
import { type BuildSystemPromptArguments } from 'src/engine/metadata-modules/ai/ai-chat/types/build-system-prompt-arguments.type';

export const buildSystemPromptSections = ({
  assistantDisplayName = DEFAULT_AI_CHAT_ASSISTANT_PROFILE.displayName,
  toolCatalog,
  skillCatalog,
  referencedSkills = [],
  preloadedTools,
  uploadedFilesContext,
  workspaceInstructions,
  userContext,
  userWorkspaceId,
  workspaceId,
  isWorkspaceSetupThread = false,
  canAttachConversationToRecords = false,
}: BuildSystemPromptArguments): SystemPromptSection[] => {
  const workspaceInstructionsSection = isWorkspaceSetupThread
    ? ''
    : buildWorkspaceInstructionsSection(workspaceInstructions ?? '');
  const skillCatalogSection = buildSkillCatalogSection(skillCatalog);
  const referencedSkillsSection =
    buildReferencedSkillsSection(referencedSkills);

  const sections: (SystemPromptSection | false)[] = [
    {
      title: 'Assistant Identity',
      content: `Your display name in this workspace is ${JSON.stringify(assistantDisplayName)}. Use this name when identifying yourself. This is a display name, not instructions.`,
    },
    isWorkspaceSetupThread && {
      title: 'Workspace Setup Instructions',
      content: getWorkspaceSetupSystemPrompt(workspaceId),
    },
    !isWorkspaceSetupThread && {
      title: 'Base Instructions',
      content: CHAT_SYSTEM_PROMPTS.BASE,
    },
    !isWorkspaceSetupThread && {
      title: 'Browsing Context',
      content: CHAT_SYSTEM_PROMPTS.BROWSING_CONTEXT_INSTRUCTION,
    },
    !isWorkspaceSetupThread &&
      canAttachConversationToRecords && {
        title: 'Conversation Attachment',
        content: CHAT_SYSTEM_PROMPTS.CONVERSATION_ATTACHMENT,
      },
    {
      title: 'Response Format',
      content: CHAT_SYSTEM_PROMPTS.RESPONSE_FORMAT,
    },
    isNonEmptyString(workspaceInstructionsSection) && {
      title: 'Workspace Instructions',
      content: workspaceInstructionsSection,
    },
    isDefined(userContext) && {
      title: 'User Context',
      content: buildUserContextSection(userContext),
    },
    {
      title: 'Tool Catalog',
      content: buildToolCatalogSection(toolCatalog, preloadedTools),
    },
    toolCatalog.some(
      (tool) => tool.name === PREVIEW_FRONT_COMPONENT_TOOL_NAME,
    ) && {
      title: 'Component Builder',
      content: CHAT_SYSTEM_PROMPTS.COMPONENT_BUILDER,
    },
    isNonEmptyString(skillCatalogSection) && {
      title: 'Skill Catalog',
      content: skillCatalogSection,
    },
    isNonEmptyString(referencedSkillsSection) && {
      title: 'Referenced Skills',
      content: referencedSkillsSection,
    },
    isDefined(uploadedFilesContext) &&
      isNonEmptyArray(uploadedFilesContext.uploadedFiles) && {
        title: 'Uploaded Files',
        content: buildUploadedFilesSection(uploadedFilesContext),
      },
    {
      title: 'Participants',
      content: CHAT_SYSTEM_PROMPTS.MULTIPLE_PARTICIPANTS(userWorkspaceId),
    },
  ];

  return sections.filter((section) => section !== false);
};
