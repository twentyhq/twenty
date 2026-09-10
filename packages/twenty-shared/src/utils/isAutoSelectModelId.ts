import { AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID } from '../ai/constants/auto-select-workspace-default-model-id.const';
import { getAiModelTierFromModelId } from '../ai/utils/get-ai-model-tier-from-model-id.util';

export const isAutoSelectModelId = (modelId: string): boolean =>
  modelId === AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID ||
  getAiModelTierFromModelId(modelId) !== undefined;
