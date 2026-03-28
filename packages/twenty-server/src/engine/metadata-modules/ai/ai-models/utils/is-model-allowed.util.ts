import { isAutoSelectModelId } from 'twenty-shared/utils';

export type WorkspaceModelAvailabilitySettings = {
  useRecommendedModels: boolean;
  enabledAiModelIds: string[];
};

export const isModelAllowedByWorkspace = (
  modelId: string,
  workspace: WorkspaceModelAvailabilitySettings,
  recommendedModelIds?: Set<string>,
): boolean => {
  if (isAutoSelectModelId(modelId)) {
    return true;
  }

  if (workspace.useRecommendedModels) {
    return recommendedModelIds?.has(modelId) ?? false;
  }

  return workspace.enabledAiModelIds.includes(modelId);
};
