import { type LongContextCost } from 'src/engine/metadata-modules/ai/ai-models/types/long-context-cost.type';
import { type ModelFamily } from 'src/engine/metadata-modules/ai/ai-models/types/model-family.enum';

export type AiModelSource = 'catalog' | 'manual';

export type AiProviderModelConfig = {
  // Bare model name passed to the AI SDK (e.g. `gpt-4o`, `claude-3-opus`), not the composite `provider/modelName` id.
  name: string;
  label: string;
  description?: string;
  modelFamily?: ModelFamily;
  inputCostPerMillionTokens?: number;
  outputCostPerMillionTokens?: number;
  cachedInputCostPerMillionTokens?: number;
  cacheCreationCostPerMillionTokens?: number;
  longContextCost?: LongContextCost;
  contextWindowTokens?: number;
  maxOutputTokens?: number;
  modalities?: string[];
  supportsReasoning?: boolean;
  isDeprecated?: boolean;
  source?: AiModelSource;
};
