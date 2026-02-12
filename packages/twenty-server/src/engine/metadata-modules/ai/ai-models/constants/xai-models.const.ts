import { type AIModelConfig, ModelProvider } from './ai-models-types.const';

export const XAI_MODELS: AIModelConfig[] = [
  // Active models
  {
    modelId: 'grok-4-1-fast-reasoning',
    label: 'Grok 4.1 Fast',
    description:
      'Next-generation tool-calling agent with 2M context for advanced agentic workflows',
    provider: ModelProvider.XAI,
    inputCostPer1kTokensInCents: 0.02,
    outputCostPer1kTokensInCents: 0.05,
    contextWindowTokens: 2000000,
    maxOutputTokens: 8192,
    supportedFileTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
    doesSupportThinking: true,
    nativeCapabilities: {
      webSearch: true,
      twitterSearch: true,
    },
  },
  {
    modelId: 'grok-4',
    label: 'Grok-4',
    description:
      'Most capable Grok model with enhanced reasoning, web and Twitter search',
    provider: ModelProvider.XAI,
    inputCostPer1kTokensInCents: 0.3,
    outputCostPer1kTokensInCents: 1.5,
    contextWindowTokens: 256000,
    maxOutputTokens: 8192,
    supportedFileTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
    nativeCapabilities: {
      webSearch: true,
      twitterSearch: true,
    },
  },
  {
    modelId: 'grok-3',
    label: 'Grok-3',
    description:
      'Advanced model with web and Twitter search, optimized for real-time information',
    provider: ModelProvider.XAI,
    inputCostPer1kTokensInCents: 0.3,
    outputCostPer1kTokensInCents: 1.5,
    contextWindowTokens: 131072,
    maxOutputTokens: 8192,
    supportedFileTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
    nativeCapabilities: {
      webSearch: true,
      twitterSearch: true,
    },
  },
  {
    modelId: 'grok-3-mini',
    label: 'Grok-3 Mini',
    description:
      'Lightweight model with web and Twitter search for fast, cost-effective operations',
    provider: ModelProvider.XAI,
    inputCostPer1kTokensInCents: 0.03,
    outputCostPer1kTokensInCents: 0.05,
    contextWindowTokens: 131072,
    maxOutputTokens: 8192,
    supportedFileTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
    nativeCapabilities: {
      webSearch: true,
      twitterSearch: true,
    },
  },
];
