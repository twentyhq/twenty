import { type AiSdkPackage, type DataResidency } from 'twenty-shared/ai';

import { type AiProviderModelConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-model-config.type';

export type AiProviderConfig = {
  npm: AiSdkPackage;
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
