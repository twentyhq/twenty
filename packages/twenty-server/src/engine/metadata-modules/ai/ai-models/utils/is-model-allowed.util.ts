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
    // No recommended models configured → nothing to restrict against
    if (!recommendedModelIds || recommendedModelIds.size === 0) {
      return true;
    }

    return recommendedModelIds.has(modelId);
  }

  return workspace.enabledAiModelIds.includes(modelId);
};
