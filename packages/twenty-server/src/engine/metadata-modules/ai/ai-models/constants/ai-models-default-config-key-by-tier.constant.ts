import { type AiModelTier } from 'twenty-shared/ai';

export const AI_MODELS_DEFAULT_CONFIG_KEY_BY_TIER = {
  extraFast: 'AI_MODELS_DEFAULT_EXTRA_FAST',
  fast: 'AI_MODELS_DEFAULT_FAST',
  balanced: 'AI_MODELS_DEFAULT_BALANCED',
  smart: 'AI_MODELS_DEFAULT_SMART',
  extraSmart: 'AI_MODELS_DEFAULT_EXTRA_SMART',
} as const satisfies Record<AiModelTier, string>;
