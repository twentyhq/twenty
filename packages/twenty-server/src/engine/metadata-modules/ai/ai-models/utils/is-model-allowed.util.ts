import {
  DEFAULT_FAST_MODEL,
  DEFAULT_SMART_MODEL,
} from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers.types';

export type WorkspaceModelAvailabilitySettings = {
  useRecommendedModels: boolean;
  enabledAiModelIds: string[];
};

export const isModelAllowedByWorkspace = (
  modelId: string,
  workspace: WorkspaceModelAvailabilitySettings,
  recommendedModelIds?: Set<string>,
): boolean => {
  if (modelId === DEFAULT_FAST_MODEL || modelId === DEFAULT_SMART_MODEL) {
    return true;
  }

  if (workspace.useRecommendedModels) {
    return recommendedModelIds?.has(modelId) ?? false;
  }

  return workspace.enabledAiModelIds.includes(modelId);
};
