import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { type UserContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-actor-context.service';
import { type ReferencedSkill } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-referenced-skills-section.util';
import { type UploadedFileReference } from 'src/engine/metadata-modules/ai/ai-chat/types/uploaded-file-reference.type';
import { type FlatSkill } from 'src/engine/metadata-modules/flat-skill/types/flat-skill.type';

export type BuildSystemPromptArguments = {
  assistantDisplayName?: string;
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
};
