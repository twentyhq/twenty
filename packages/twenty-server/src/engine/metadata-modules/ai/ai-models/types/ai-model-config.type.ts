import { type DataResidency } from 'src/engine/metadata-modules/ai/ai-models/types/data-residency.type';
import { type LongContextCost } from 'src/engine/metadata-modules/ai/ai-models/types/long-context-cost.type';
import { type ModelFamily } from 'src/engine/metadata-modules/ai/ai-models/types/model-family.enum';
import { type SupportedFileType } from 'src/engine/metadata-modules/ai/ai-models/types/supported-file-type.type';

export type AIModelConfig = {
  modelId: string;
  // npm package for the SDK driver (e.g. '@ai-sdk/openai')
  sdkPackage: string;
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
  supportedFileTypes?: SupportedFileType[];
  doesSupportThinking?: boolean;
  nativeCapabilities?: { webSearch?: boolean; twitterSearch?: boolean };
  deprecated?: boolean;
};
