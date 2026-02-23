import {
  type AIModelConfig,
  InferenceProvider,
  ModelFamily,
} from './ai-models-types.const';

export const BEDROCK_MODELS: AIModelConfig[] = [
  {
    modelId: 'anthropic.claude-opus-4-6-v1',
    label: 'Claude Opus 4.6 (Bedrock)',
    description:
      'Flagship Claude model via AWS Bedrock for enterprise deployments',
    modelFamily: ModelFamily.ANTHROPIC,
    inferenceProvider: InferenceProvider.BEDROCK,
    inputCostPerMillionTokens: 5.0,
    outputCostPerMillionTokens: 25.0,
    cachedInputCostPerMillionTokens: 0.5,
    cacheCreationCostPerMillionTokens: 6.25,
    longContextCost: {
      inputCostPerMillionTokens: 10.0,
      outputCostPerMillionTokens: 37.5,
      cachedInputCostPerMillionTokens: 1.0,
      cacheCreationCostPerMillionTokens: 12.5,
      thresholdTokens: 200_000,
    },
    contextWindowTokens: 1000000,
    maxOutputTokens: 128000,
    supportedFileTypes: [
      'image/png',
      'image/jpeg',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'text/html',
      'text/csv',
    ],
    doesSupportThinking: true,
    nativeCapabilities: {
      webSearch: true,
    },
  },
  {
    modelId: 'anthropic.claude-sonnet-4-6',
    label: 'Claude Sonnet 4.6 (Bedrock)',
    description:
      'Balanced Claude model via AWS Bedrock with strong coding and agent planning',
    modelFamily: ModelFamily.ANTHROPIC,
    inferenceProvider: InferenceProvider.BEDROCK,
    inputCostPerMillionTokens: 3.0,
    outputCostPerMillionTokens: 15.0,
    cachedInputCostPerMillionTokens: 0.3,
    cacheCreationCostPerMillionTokens: 3.75,
    longContextCost: {
      inputCostPerMillionTokens: 6.0,
      outputCostPerMillionTokens: 22.5,
      cachedInputCostPerMillionTokens: 0.6,
      cacheCreationCostPerMillionTokens: 7.5,
      thresholdTokens: 200_000,
    },
    contextWindowTokens: 200000,
    maxOutputTokens: 64000,
    supportedFileTypes: [
      'image/png',
      'image/jpeg',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'text/html',
      'text/csv',
    ],
    doesSupportThinking: true,
    nativeCapabilities: {
      webSearch: true,
    },
  },
];
