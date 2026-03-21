import { type AiSdkPackage, type DataResidency } from 'twenty-shared/ai';
import { type LongContextCost } from 'src/engine/metadata-modules/ai/ai-models/types/long-context-cost.type';
import { type ModelFamily } from 'src/engine/metadata-modules/ai/ai-models/types/model-family.enum';

// TODO: rename to AiModelConfig for consistency with service naming (AiModelRegistryService, etc.)
export type AIModelConfig = {
  // Composite model id (`provider/modelName`) used in the registry and GraphQL; same shape as SDK routing when applicable.
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
  isDeprecated?: boolean;
};
