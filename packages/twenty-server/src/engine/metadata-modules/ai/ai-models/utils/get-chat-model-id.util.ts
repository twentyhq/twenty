import { AUTO_SELECT_MODEL_ID_BY_TIER } from 'twenty-shared/ai';

import { type WorkspaceAiModelSettings } from 'src/engine/metadata-modules/ai/ai-models/types/workspace-ai-model-settings.type';

// A chat turn that names no model runs on the workspace chat tier.
export const getChatModelId = (
  requestedModelId: string | null | undefined,
  workspace: Pick<WorkspaceAiModelSettings, 'aiChatModelTier'>,
): string =>
  requestedModelId ?? AUTO_SELECT_MODEL_ID_BY_TIER[workspace.aiChatModelTier];
