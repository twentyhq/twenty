import { type AiProviderModelConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-model-config.type';
import { type DataResidency } from 'src/engine/metadata-modules/ai/ai-models/types/data-residency.type';

export type AiProviderConfig = {
  // npm package for the AI SDK driver (e.g. '@ai-sdk/openai')
  npm: string;
  // models.dev provider identifier (e.g. 'openai', 'anthropic')
  name?: string;
  label?: string;
  apiKey?: string;
  baseUrl?: string;
  region?: string;
  dataResidency?: DataResidency;
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string;
  models?: AiProviderModelConfig[];
};
