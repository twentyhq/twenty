export enum InferenceProvider {
  NONE = 'none',
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  BEDROCK = 'bedrock',
  GOOGLE = 'google',
  MISTRAL = 'mistral',
  OPENAI_COMPATIBLE = 'open_ai_compatible',
  XAI = 'xai',
  GROQ = 'groq',
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

export type ModelId =
  | typeof DEFAULT_FAST_MODEL
  | typeof DEFAULT_SMART_MODEL
  // OpenAI models
  | 'gpt-5.2'
  | 'gpt-5-mini'
  | 'gpt-4.1'
  | 'gpt-4.1-mini'
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'gpt-4-turbo'
  | 'o3'
  | 'o4-mini'
  // Anthropic models
  | 'claude-opus-4-6'
  | 'claude-sonnet-4-6'
  | 'claude-sonnet-4-5-20250929'
  | 'claude-haiku-4-5-20251001'
  | 'claude-opus-4-5-20251101'
  | 'claude-opus-4-20250514'
  | 'claude-sonnet-4-20250514'
  | 'claude-3-5-haiku-20241022'
  // xAI models
  | 'grok-4'
  | 'grok-4-1-fast-reasoning'
  | 'grok-3'
  | 'grok-3-mini'
  // Google models
  | 'gemini-3.1-pro-preview'
  | 'gemini-3-flash-preview'
  | 'gemini-2.5-pro'
  | 'gemini-2.5-flash'
  // Bedrock models (Anthropic via AWS)
  | 'anthropic.claude-opus-4-6-v1'
  | 'anthropic.claude-sonnet-4-6'
  // Groq models
  | 'openai/gpt-oss-120b'
  // Mistral models
  | 'mistral-large-latest'
  | string; // Allow custom model names

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

export interface AIModelConfig {
  modelId: ModelId;
  label: string;
  description: string;
  modelFamily: ModelFamily;
  inferenceProvider: InferenceProvider;
  inputCostPerMillionTokens: number;
  outputCostPerMillionTokens: number;
  cachedInputCostPerMillionTokens?: number;
  cacheCreationCostPerMillionTokens?: number;
  longContextCost?: LongContextCost;
  contextWindowTokens: number;
  maxOutputTokens: number;
  supportedFileTypes?: SupportedFileType[];
  doesSupportThinking?: boolean;
  nativeCapabilities?: {
    webSearch?: boolean;
    twitterSearch?: boolean;
  };
  deprecated?: boolean;
  isRecommended?: boolean;
}
