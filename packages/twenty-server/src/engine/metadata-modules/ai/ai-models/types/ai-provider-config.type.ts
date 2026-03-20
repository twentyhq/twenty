import { type AiProvider } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider.enum';
import { type AiProviderModelConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-model-config.type';
import { type DataResidency } from 'src/engine/metadata-modules/ai/ai-models/types/data-residency.type';

export type AiProviderConfig = {
  type: AiProvider;
  label?: string;
  apiKey?: string;
  baseUrl?: string;
  region?: string;
  dataResidency?: DataResidency;
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string;
  models?: AiProviderModelConfig[];
  // @deprecated Use models[] instead. Kept for backward compat with openai-compatible configs.
  modelNames?: string[];
};
