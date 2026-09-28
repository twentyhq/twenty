import { type LongContextCost } from 'src/engine/metadata-modules/ai/ai-models/types/long-context-cost.type';
import { type ModelFamily } from 'src/engine/metadata-modules/ai/ai-models/types/model-family.enum';

// What costing needs from a model, whatever kind it is. Both AiModelConfig and
// AiEvaluationModelConfig satisfy it, so token billing has one implementation.
export type AiModelCostConfig = {
  modelId: string;
  modelFamily?: ModelFamily;
  inputCostPerMillionTokens: number;
  outputCostPerMillionTokens: number;
  cachedInputCostPerMillionTokens?: number;
  cacheCreationCostPerMillionTokens?: number;
  longContextCost?: LongContextCost;
};
