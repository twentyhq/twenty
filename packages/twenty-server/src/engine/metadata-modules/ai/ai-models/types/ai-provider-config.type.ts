import { type AiSdkPackage, type DataResidency } from 'twenty-shared/ai';

import { type AiProviderAuthType } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-auth-type.type';
import { type AiProviderModelConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-model-config.type';

export type AiProviderConfig = {
  npm: AiSdkPackage;
  // Optional provider display/catalog name (e.g. models.dev label). Not a model name; per-model names live on `models[].name`.
  name?: string;
  label?: string;
  authType?: AiProviderAuthType;
  apiKey?: string;
  baseUrl?: string;
  region?: string;
  dataResidency?: DataResidency;
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string;
  models?: AiProviderModelConfig[];
};
