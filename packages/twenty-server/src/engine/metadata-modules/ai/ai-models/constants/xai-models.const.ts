import {
  type AIModelConfig,
  InferenceProvider,
  ModelFamily,
} from './ai-models-types.const';

export const XAI_MODELS: AIModelConfig[] = [
  // Active models
  {
    modelId: 'grok-4',
    label: 'Grok-4',
    description:
      'Most capable Grok model with enhanced reasoning, web and Twitter search',
    modelFamily: ModelFamily.XAI,
    inferenceProvider: InferenceProvider.XAI,
    inputCostPerMillionTokens: 3.0,
    outputCostPerMillionTokens: 15.0,
    cachedInputCostPerMillionTokens: 0.75,
    contextWindowTokens: 256000,
    maxOutputTokens: 8192,
    supportedFileTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
    nativeCapabilities: {
      webSearch: true,
      twitterSearch: true,
    },
    isRecommended: true,
  },
  {
    modelId: 'grok-4-1-fast-reasoning',
    label: 'Grok 4.1 Fast',
    description:
      'Next-generation tool-calling agent with 2M context for advanced agentic workflows',
    modelFamily: ModelFamily.XAI,
    inferenceProvider: InferenceProvider.XAI,
    inputCostPerMillionTokens: 0.2,
    outputCostPerMillionTokens: 0.5,
    cachedInputCostPerMillionTokens: 0.05,
    contextWindowTokens: 2000000,
    maxOutputTokens: 8192,
    supportedFileTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
    doesSupportThinking: true,
    nativeCapabilities: {
      webSearch: true,
      twitterSearch: true,
    },
  },

  // Deprecated models - kept for backward compatibility with existing agents
  {
    modelId: 'grok-3',
    label: 'Grok-3',
    description:
      'Advanced model with web and Twitter search, optimized for real-time information',
    modelFamily: ModelFamily.XAI,
    inferenceProvider: InferenceProvider.XAI,
    inputCostPerMillionTokens: 3.0,
    outputCostPerMillionTokens: 15.0,
    cachedInputCostPerMillionTokens: 0.75,
    contextWindowTokens: 131072,
    maxOutputTokens: 8192,
    supportedFileTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
    nativeCapabilities: {
      webSearch: true,
      twitterSearch: true,
    },
    deprecated: true,
  },
  {
    modelId: 'grok-3-mini',
    label: 'Grok-3 Mini',
    description:
      'Lightweight model with web and Twitter search for fast, cost-effective operations',
    modelFamily: ModelFamily.XAI,
    inferenceProvider: InferenceProvider.XAI,
    inputCostPerMillionTokens: 0.3,
    outputCostPerMillionTokens: 0.5,
    cachedInputCostPerMillionTokens: 0.07,
    contextWindowTokens: 131072,
    maxOutputTokens: 8192,
    supportedFileTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
    nativeCapabilities: {
      webSearch: true,
      twitterSearch: true,
    },
    deprecated: true,
  },
];
