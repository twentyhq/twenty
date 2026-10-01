import { type WorkspaceSetupPromptVariant } from 'src/engine/metadata-modules/ai/ai-chat/types/workspace-setup-prompt-variant.type';

// A/B split on the workspace id parity: stable across turns without storing anything,
// and still computable in SQL from billing tables once trial workspaces are destroyed.
export const getWorkspaceSetupPromptVariant = (
  workspaceId: string,
): WorkspaceSetupPromptVariant =>
  parseInt(workspaceId.slice(-1), 16) % 2 === 0 ? 'original' : 'alternative';
