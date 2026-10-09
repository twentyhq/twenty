import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { buildToolCatalogSection } from 'src/engine/core-modules/tool-provider/utils/build-tool-catalog-section.util';
import { type UserContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-actor-context.service';
import { CHAT_SYSTEM_PROMPTS } from 'src/engine/metadata-modules/ai/ai-chat/constants/chat-system-prompts.const';
import {
  buildReferencedSkillsSection,
  type ReferencedSkill,
} from 'src/engine/metadata-modules/ai/ai-chat/utils/build-referenced-skills-section.util';
import { buildSkillCatalogSection } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-skill-catalog-section.util';
import { buildUploadedFilesSection } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-uploaded-files-section.util';
import { buildUserContextSection } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-user-context-section.util';
import { buildWorkspaceInstructionsSection } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-workspace-instructions-section.util';
import { getWorkspaceSetupSystemPrompt } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-workspace-setup-system-prompt.util';
import { type UploadedFileReference } from 'src/engine/metadata-modules/ai/ai-chat/types/uploaded-file-reference.type';
import { type FlatSkill } from 'src/engine/metadata-modules/flat-skill/types/flat-skill.type';

export type SystemPromptSection = {
  title: string;
  content: string;
};

type BuildSystemPromptArgs = {
  toolCatalog: ToolIndexEntry[];
  skillCatalog: FlatSkill[];
  referencedSkills?: ReferencedSkill[];
  preloadedTools: string[];
  uploadedFilesContext?: {
    uploadedFiles: UploadedFileReference[];
    codeInterpreterFiles: UploadedFileReference[];
  };
  workspaceInstructions?: string;
  userContext?: UserContext;
  userWorkspaceId: string;
  workspaceId: string;
  isWorkspaceSetupThread?: boolean;
  canAttachConversationToRecords?: boolean;
  isCodeModeEnabled?: boolean;
};

export const buildSystemPromptSections = ({
  toolCatalog,
  skillCatalog,
  referencedSkills = [],
  preloadedTools,
  uploadedFilesContext,
  workspaceInstructions,
  userContext,
  userWorkspaceId,
  workspaceId,
  isWorkspaceSetupThread,
  canAttachConversationToRecords,
  isCodeModeEnabled,
}: BuildSystemPromptArgs): SystemPromptSection[] => {
  const workspaceInstructionsSection = isWorkspaceSetupThread
    ? ''
    : buildWorkspaceInstructionsSection(workspaceInstructions ?? '');
  const skillCatalogSection = buildSkillCatalogSection(skillCatalog);
  const referencedSkillsSection =
    buildReferencedSkillsSection(referencedSkills);

  const sections: (SystemPromptSection | false)[] = [
    ...(isWorkspaceSetupThread
      ? [
          {
            title: 'Workspace Setup Instructions',
            content: getWorkspaceSetupSystemPrompt(workspaceId),
          },
        ]
      : [
          { title: 'Base Instructions', content: CHAT_SYSTEM_PROMPTS.BASE },
          {
            title: 'Browsing Context',
            content: CHAT_SYSTEM_PROMPTS.BROWSING_CONTEXT_INSTRUCTION,
          },
          canAttachConversationToRecords === true && {
            title: 'Conversation Attachment',
            content: CHAT_SYSTEM_PROMPTS.CONVERSATION_ATTACHMENT,
          },
        ]),
    isCodeModeEnabled === true && {
      title: 'Code Mode',
      content: CHAT_SYSTEM_PROMPTS.CODE_MODE,
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

export const buildFullSystemPrompt = (args: BuildSystemPromptArgs): string =>
  buildSystemPromptSections(args)
    .map((section) => section.content)
    .join('\n');
