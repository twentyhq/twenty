export enum ModelProvider {
  NONE = 'none',
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  OPENAI_COMPATIBLE = 'open_ai_compatible',
  XAI = 'xai',
}

export const DEFAULT_FAST_MODEL = 'default-fast-model' as const;
export const DEFAULT_SMART_MODEL = 'default-smart-model' as const;

export type ModelId =
  | typeof DEFAULT_FAST_MODEL
  | typeof DEFAULT_SMART_MODEL
  // OpenAI models
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'gpt-4-turbo'
  | 'gpt-4.1'
  | 'gpt-4.1-mini'
  | 'o3'
  | 'o4-mini'
  // Anthropic models
  | 'claude-opus-4-20250514'
  | 'claude-sonnet-4-20250514'
  | 'claude-3-5-haiku-20241022'
  | 'claude-opus-4-5-20251101'
  | 'claude-sonnet-4-5-20250929'
  | 'claude-haiku-4-5-20251001'
  // xAI models
  | 'grok-3'
  | 'grok-3-mini'
  | 'grok-4'
  | 'grok-4-1-fast-reasoning'
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

export interface AIModelConfig {
  modelId: ModelId;
  label: string;
  description: string;
  provider: ModelProvider;
  inputCostPer1kTokensInCents: number;
  outputCostPer1kTokensInCents: number;
  contextWindowTokens: number;
  maxOutputTokens: number;
  supportedFileTypes?: SupportedFileType[];
  doesSupportThinking?: boolean;
  nativeCapabilities?: {
    webSearch?: boolean;
    twitterSearch?: boolean;
  };
  deprecated?: boolean;
}
