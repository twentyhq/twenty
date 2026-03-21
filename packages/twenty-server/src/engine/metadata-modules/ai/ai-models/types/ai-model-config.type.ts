import { type AiSdkPackage, type DataResidency } from 'twenty-shared/ai';
import { type LongContextCost } from 'src/engine/metadata-modules/ai/ai-models/types/long-context-cost.type';
import { type ModelFamily } from 'src/engine/metadata-modules/ai/ai-models/types/model-family.enum';

export type AIModelConfig = {
  modelId: string;
  sdkPackage: AiSdkPackage;
  label: string;
  description: string;
  modelFamily?: ModelFamily;
  dataResidency?: DataResidency;
  inputCostPerMillionTokens: number;
  outputCostPerMillionTokens: number;
  contextWindowTokens: number;
  maxOutputTokens: number;
  cachedInputCostPerMillionTokens?: number;
  cacheCreationCostPerMillionTokens?: number;
  longContextCost?: LongContextCost;
  modalities?: string[];
  supportsReasoning?: boolean;
  deprecated?: boolean;
};
