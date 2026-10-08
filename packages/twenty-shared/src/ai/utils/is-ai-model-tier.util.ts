import {
  AI_MODEL_TIERS,
  type AiModelTier,
} from '../constants/ai-model-tier.const';

export const isAiModelTier = (value: unknown): value is AiModelTier =>
  typeof value === 'string' &&
  (AI_MODEL_TIERS as readonly string[]).includes(value);
