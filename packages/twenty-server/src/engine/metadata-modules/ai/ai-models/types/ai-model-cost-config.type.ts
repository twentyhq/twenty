import { type LongContextCost } from 'src/engine/metadata-modules/ai/ai-models/types/long-context-cost.type';

export type AiModelCostConfig = {
  modelId: string;
  inputCostPerMillionTokens: number;
  outputCostPerMillionTokens: number;
  cachedInputCostPerMillionTokens?: number;
  cacheCreationCostPerMillionTokens?: number;
  longContextCost?: LongContextCost;
};
