import { PREMIUM_AI_MODEL_MIN_INPUT_COST_PER_MILLION_TOKENS } from 'src/engine/metadata-modules/ai/ai-models/constants/premium-ai-model-min-input-cost-per-million-tokens.const';
import { type AiModelCostConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-cost-config.type';

export const isPremiumAiModel = (
  modelConfig: Pick<AiModelCostConfig, 'inputCostPerMillionTokens'>,
): boolean =>
  modelConfig.inputCostPerMillionTokens >=
  PREMIUM_AI_MODEL_MIN_INPUT_COST_PER_MILLION_TOKENS;
