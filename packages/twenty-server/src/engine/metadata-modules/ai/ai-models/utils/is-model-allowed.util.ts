import { isDefaultModelSentinel } from 'src/engine/metadata-modules/ai/ai-models/utils/is-default-model-sentinel.util';

export type WorkspaceModelAvailabilitySettings = {
  useRecommendedModels: boolean;
  enabledAiModelIds: string[];
};

export const isModelAllowedByWorkspace = (
  modelId: string,
  workspace: WorkspaceModelAvailabilitySettings,
  recommendedModelIds?: Set<string>,
): boolean => {
  if (isDefaultModelSentinel(modelId)) {
    return true;
  }

  if (workspace.useRecommendedModels) {
    return recommendedModelIds?.has(modelId) ?? false;
  }

  return workspace.enabledAiModelIds.includes(modelId);
};
