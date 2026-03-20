import { type LongContextCost } from 'src/engine/metadata-modules/ai/ai-models/types/long-context-cost.type';
import { type ModelFamily } from 'src/engine/metadata-modules/ai/ai-models/types/model-family.enum';
import { type SupportedFileType } from 'src/engine/metadata-modules/ai/ai-models/types/supported-file-type.type';

export type AiProviderModelConfig = {
  rawModelId: string;
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
  supportedFileTypes?: SupportedFileType[];
  doesSupportThinking?: boolean;
  nativeCapabilities?: { webSearch?: boolean; twitterSearch?: boolean };
  deprecated?: boolean;
  // Used as a seeding hint in ai-providers.json for loadDefaultModelPreferences()
  isRecommended?: boolean;
  source?: 'catalog' | 'manual';
};
