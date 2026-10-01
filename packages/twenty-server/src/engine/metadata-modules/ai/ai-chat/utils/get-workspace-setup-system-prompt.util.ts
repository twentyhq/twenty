import { WORKSPACE_SETUP_ALTERNATIVE_SYSTEM_PROMPT } from 'src/engine/metadata-modules/ai/ai-chat/constants/workspace-setup-alternative-system-prompt.constant';
import { WORKSPACE_SETUP_SYSTEM_PROMPT } from 'src/engine/metadata-modules/ai/ai-chat/constants/workspace-setup-system-prompt.constant';
import { getWorkspaceSetupPromptVariant } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-workspace-setup-prompt-variant.util';

export const getWorkspaceSetupSystemPrompt = (workspaceId: string): string =>
  getWorkspaceSetupPromptVariant(workspaceId) === 'original'
    ? WORKSPACE_SETUP_SYSTEM_PROMPT
    : WORKSPACE_SETUP_ALTERNATIVE_SYSTEM_PROMPT;
