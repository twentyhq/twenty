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

export const DEFAULT_CONTEXT_WINDOW_TOKENS = 128_000;
export const DEFAULT_MAX_OUTPUT_TOKENS = 4_096;

export const isDefaultModelSentinel = (modelId: string): boolean =>
  modelId === DEFAULT_FAST_MODEL || modelId === DEFAULT_SMART_MODEL;

// Composite format: `provider/rawModelId` or a sentinel like DEFAULT_FAST_MODEL
export type ModelId =
  | typeof DEFAULT_FAST_MODEL
  | typeof DEFAULT_SMART_MODEL
  | (string & {});

// Geographic region for data residency. Used by custom providers
// and cloud infrastructure to indicate where inference runs.
export type DataResidency = 'us' | 'eu' | 'global' | (string & {});

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

// Storage format: what goes into the provider catalog or custom providers JSON
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
  source?: 'catalog' | 'discovered' | 'manual';
};

export type AiProviderConfig = {
  type: AiProvider;
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

export type AiProvidersConfig = Record<string, AiProviderConfig>;

// Admin preferences: separate from the model catalog.
// Stored in AI_MODEL_PREFERENCES config variable.
export type AiModelPreferences = {
  disabledModels?: string[];
  recommendedModels?: string[];
  defaultFastModels?: string[];
  defaultSmartModels?: string[];
};

// Runtime format: hydrated model config with computed fields
export type AIModelConfig = {
  modelId: string;
  provider: AiProvider;
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

const PROVIDER_TO_MODEL_FAMILY: Partial<Record<AiProvider, ModelFamily>> = {
  [AiProvider.OPENAI]: ModelFamily.OPENAI,
  [AiProvider.ANTHROPIC]: ModelFamily.ANTHROPIC,
  [AiProvider.GOOGLE]: ModelFamily.GOOGLE,
  [AiProvider.MISTRAL]: ModelFamily.MISTRAL,
  [AiProvider.XAI]: ModelFamily.XAI,
};

// For aggregator providers (Groq, Bedrock, etc.), detect model family
// from the model's raw ID rather than assuming a fixed mapping.
const MODEL_ID_FAMILY_PATTERNS: [RegExp, ModelFamily][] = [
  [/claude/i, ModelFamily.ANTHROPIC],
  [/gpt|o[134]-|chatgpt/i, ModelFamily.OPENAI],
  [/gemini/i, ModelFamily.GOOGLE],
  [/mistral|mixtral|pixtral/i, ModelFamily.MISTRAL],
  [/grok/i, ModelFamily.XAI],
];

export const inferModelFamily = (
  provider: AiProvider,
  rawModelId?: string,
): ModelFamily | undefined => {
  const fromProvider = PROVIDER_TO_MODEL_FAMILY[provider];

  if (fromProvider) {
    return fromProvider;
  }

  if (rawModelId) {
    for (const [pattern, family] of MODEL_ID_FAMILY_PATTERNS) {
      if (pattern.test(rawModelId)) {
        return family;
      }
    }
  }

  return undefined;
};
