import {
  AI_MODELS,
  DEFAULT_FAST_MODEL,
  DEFAULT_SMART_MODEL,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-models.const';

export type WorkspaceModelAvailabilitySettings = {
  useRecommendedModels: boolean;
  autoEnableNewAiModels: boolean;
  disabledAiModelIds: string[];
  enabledAiModelIds: string[];
};

const RECOMMENDED_MODEL_IDS = new Set(
  AI_MODELS.filter((model) => model.isRecommended).map(
    (model) => model.modelId,
  ),
);

export const isModelAllowedByWorkspace = (
  modelId: string,
  workspace: WorkspaceModelAvailabilitySettings,
): boolean => {
  if (modelId === DEFAULT_FAST_MODEL || modelId === DEFAULT_SMART_MODEL) {
    return true;
  }

  if (workspace.useRecommendedModels) {
    return RECOMMENDED_MODEL_IDS.has(modelId);
  }

  return workspace.autoEnableNewAiModels
    ? !workspace.disabledAiModelIds.includes(modelId)
    : workspace.enabledAiModelIds.includes(modelId);
};
