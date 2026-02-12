import { type AIModelConfig, ModelProvider } from './ai-models-types.const';

export const OPENAI_MODELS: AIModelConfig[] = [
  // Active models
  {
    modelId: 'gpt-4.1',
    label: 'GPT-4.1',
    description:
      'Advanced model excelling in coding, instruction following, and long-context comprehension',
    provider: ModelProvider.OPENAI,
    inputCostPer1kTokensInCents: 0.2,
    outputCostPer1kTokensInCents: 0.8,
    contextWindowTokens: 1047576,
    maxOutputTokens: 32768,
    supportedFileTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
    nativeCapabilities: {
      webSearch: true,
    },
  },
  {
    modelId: 'gpt-4.1-mini',
    label: 'GPT-4.1 Mini',
    description:
      'Fast and cost-efficient version of GPT-4.1 optimized for low latency',
    provider: ModelProvider.OPENAI,
    inputCostPer1kTokensInCents: 0.04,
    outputCostPer1kTokensInCents: 0.16,
    contextWindowTokens: 1047576,
    maxOutputTokens: 32768,
    supportedFileTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
    nativeCapabilities: {
      webSearch: true,
    },
  },
  {
    modelId: 'o3',
    label: 'o3',
    description:
      'Powerful reasoning model excelling in complex queries, coding, math, and science',
    provider: ModelProvider.OPENAI,
    inputCostPer1kTokensInCents: 0.2,
    outputCostPer1kTokensInCents: 0.8,
    contextWindowTokens: 200000,
    maxOutputTokens: 100000,
    supportedFileTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
    doesSupportThinking: true,
    nativeCapabilities: {
      webSearch: true,
    },
  },
  {
    modelId: 'o4-mini',
    label: 'o4-mini',
    description:
      'Cost-effective reasoning model excelling in math, coding, and visual tasks',
    provider: ModelProvider.OPENAI,
    inputCostPer1kTokensInCents: 0.11,
    outputCostPer1kTokensInCents: 0.44,
    contextWindowTokens: 200000,
    maxOutputTokens: 100000,
    supportedFileTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
    doesSupportThinking: true,
    nativeCapabilities: {
      webSearch: true,
    },
  },

  // Deprecated models - kept for backward compatibility with existing agents
  {
    modelId: 'gpt-4o',
    label: 'GPT-4o',
    description:
      'Most advanced multimodal model with strong reasoning, vision, and coding capabilities',
    provider: ModelProvider.OPENAI,
    inputCostPer1kTokensInCents: 0.25,
    outputCostPer1kTokensInCents: 1.0,
    contextWindowTokens: 128000,
    maxOutputTokens: 16384,
    supportedFileTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
    nativeCapabilities: {
      webSearch: true,
    },
    deprecated: true,
  },
  {
    modelId: 'gpt-4o-mini',
    label: 'GPT-4o Mini',
    description:
      'Fast and cost-efficient model for lightweight tasks and high-volume operations',
    provider: ModelProvider.OPENAI,
    inputCostPer1kTokensInCents: 0.015,
    outputCostPer1kTokensInCents: 0.06,
    contextWindowTokens: 128000,
    maxOutputTokens: 16384,
    supportedFileTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
    nativeCapabilities: {
      webSearch: true,
    },
    deprecated: true,
  },
  {
    modelId: 'gpt-4-turbo',
    label: 'GPT-4 Turbo',
    description:
      'Previous generation high-performance model with vision capabilities',
    provider: ModelProvider.OPENAI,
    inputCostPer1kTokensInCents: 1.0,
    outputCostPer1kTokensInCents: 3.0,
    contextWindowTokens: 128000,
    maxOutputTokens: 4096,
    supportedFileTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
    nativeCapabilities: {
      webSearch: false,
    },
    deprecated: true,
  },
];
