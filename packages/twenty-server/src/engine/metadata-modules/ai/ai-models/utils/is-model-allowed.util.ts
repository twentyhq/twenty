import { isAutoSelectModelId } from 'twenty-shared/utils';

export type WorkspaceModelAvailabilitySettings = {
  useRecommendedModels: boolean;
  enabledAiModelIds: string[];
};

export const isModelAllowedByWorkspace = (
  modelId: string,
  availabilitySettings: WorkspaceModelAvailabilitySettings,
  recommendedModelIds?: Set<string>,
): boolean => {
  if (isAutoSelectModelId(modelId)) {
    return true;
  }

  if (availabilitySettings.useRecommendedModels) {
    return recommendedModelIds?.has(modelId) ?? false;
  }

  return availabilitySettings.enabledAiModelIds.includes(modelId);
};
