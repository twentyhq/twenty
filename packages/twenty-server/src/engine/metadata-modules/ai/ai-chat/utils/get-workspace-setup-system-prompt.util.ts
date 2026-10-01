import { WORKSPACE_SETUP_ALTERNATIVE_SYSTEM_PROMPT } from 'src/engine/metadata-modules/ai/ai-chat/constants/workspace-setup-alternative-system-prompt.constant';
import { WORKSPACE_SETUP_SYSTEM_PROMPT } from 'src/engine/metadata-modules/ai/ai-chat/constants/workspace-setup-system-prompt.constant';

// A/B split on the workspace id parity: stable across turns without storing anything,
// and still computable in SQL from billing tables once trial workspaces are destroyed.
export const getWorkspaceSetupSystemPrompt = (workspaceId: string): string =>
  parseInt(workspaceId.slice(-1), 16) % 2 === 0
    ? WORKSPACE_SETUP_SYSTEM_PROMPT
    : WORKSPACE_SETUP_ALTERNATIVE_SYSTEM_PROMPT;
