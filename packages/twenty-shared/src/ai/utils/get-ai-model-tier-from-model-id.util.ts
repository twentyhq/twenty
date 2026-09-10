import {
  AI_MODEL_TIERS,
  type AiModelTier,
} from '../constants/ai-model-tier.const';
import { AUTO_SELECT_MODEL_ID_BY_TIER } from '../constants/auto-select-model-id-by-tier.const';

export const getAiModelTierFromModelId = (
  modelId: string | null | undefined,
): AiModelTier | undefined =>
  AI_MODEL_TIERS.find((tier) => AUTO_SELECT_MODEL_ID_BY_TIER[tier] === modelId);
