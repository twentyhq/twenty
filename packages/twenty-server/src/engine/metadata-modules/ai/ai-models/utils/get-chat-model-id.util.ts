import { AUTO_SELECT_MODEL_ID_BY_TIER } from 'twenty-shared/ai';

import { type WorkspaceAiModelSettings } from 'src/engine/metadata-modules/ai/ai-models/types/workspace-ai-model-settings.type';

export const getChatModelId = ({
  requestedModelId,
  workspace,
}: {
  requestedModelId: string | null | undefined;
  workspace: Pick<WorkspaceAiModelSettings, 'aiChatModelTier'>;
}): string =>
  requestedModelId ?? AUTO_SELECT_MODEL_ID_BY_TIER[workspace.aiChatModelTier];
