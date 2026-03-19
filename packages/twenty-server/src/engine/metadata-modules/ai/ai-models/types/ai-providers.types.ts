// Single source of truth for all AI provider and model types.

export enum AiProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  BEDROCK = 'bedrock',
  GOOGLE = 'google',
  MISTRAL = 'mistral',
  XAI = 'xai',
  GROQ = 'groq',
  OPENAI_COMPATIBLE = 'openai-compatible',
}

export enum ModelFamily {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
  MISTRAL = 'mistral',
  XAI = 'xai',
}

export const DEFAULT_FAST_MODEL = 'default-fast-model' as const;
export const DEFAULT_SMART_MODEL = 'default-smart-model' as const;

// Composite format: `provider/rawModelId` or a sentinel like DEFAULT_FAST_MODEL
export type ModelId =
  | typeof DEFAULT_FAST_MODEL
  | typeof DEFAULT_SMART_MODEL
  | (string & {});

export type SupportedFileType =
  | 'image/png'
  | 'image/jpeg'
  | 'image/gif'
  | 'image/webp'
  | 'application/pdf'
  | 'text/plain'
  | 'text/html'
  | 'text/csv'
  | 'application/json';

export type LongContextCost = {
  inputCostPerMillionTokens: number;
  outputCostPerMillionTokens: number;
  cachedInputCostPerMillionTokens?: number;
  cacheCreationCostPerMillionTokens?: number;
  thresholdTokens: number;
};

// Storage format: what goes into the AI_PROVIDERS JSON config
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
  isRecommended?: boolean;
  source?: 'catalog' | 'discovered' | 'manual';
};

export type AiProviderConfig = {
  type: AiProvider;
  apiKey?: string;
  baseUrl?: string;
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string;
  models?: AiProviderModelConfig[];
  disabledModels?: string[];
  enabledModels?: string[];
  // @deprecated Use models[] instead. Kept for backward compat with openai-compatible configs.
  modelNames?: string[];
};

export type AiProvidersConfig = Record<string, AiProviderConfig>;

// Runtime format: hydrated model config with computed fields.
// Extends AiProviderModelConfig (minus rawModelId/source) with required computed fields.
export type AIModelConfig = Omit<
  AiProviderModelConfig,
  | 'rawModelId'
  | 'source'
  | 'description'
  | 'modelFamily'
  | 'inputCostPerMillionTokens'
  | 'outputCostPerMillionTokens'
  | 'contextWindowTokens'
  | 'maxOutputTokens'
> & {
  modelId: string;
  provider: AiProvider;
  description: string;
  modelFamily: ModelFamily;
  inputCostPerMillionTokens: number;
  outputCostPerMillionTokens: number;
  contextWindowTokens: number;
  maxOutputTokens: number;
};

const PROVIDER_TO_MODEL_FAMILY: Partial<Record<AiProvider, ModelFamily>> = {
  [AiProvider.OPENAI]: ModelFamily.OPENAI,
  [AiProvider.ANTHROPIC]: ModelFamily.ANTHROPIC,
  [AiProvider.BEDROCK]: ModelFamily.ANTHROPIC,
  [AiProvider.GOOGLE]: ModelFamily.GOOGLE,
  [AiProvider.MISTRAL]: ModelFamily.MISTRAL,
  [AiProvider.XAI]: ModelFamily.XAI,
  [AiProvider.GROQ]: ModelFamily.OPENAI,
};

export const inferModelFamily = (provider: AiProvider): ModelFamily =>
  PROVIDER_TO_MODEL_FAMILY[provider] ?? ModelFamily.OPENAI;
