import {
  type AIModelConfig,
  InferenceProvider,
  ModelFamily,
} from './ai-models-types.const';

export const MISTRAL_MODELS: AIModelConfig[] = [
  {
    modelId: 'mistral-large-latest',
    label: 'Mistral Large',
    description:
      'Flagship Mistral model with strong reasoning and 256K context',
    modelFamily: ModelFamily.MISTRAL,
    inferenceProvider: InferenceProvider.MISTRAL,
    inputCostPerMillionTokens: 0.5,
    outputCostPerMillionTokens: 1.5,
    contextWindowTokens: 256000,
    maxOutputTokens: 8192,
  },
];
