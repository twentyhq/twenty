import {
  type AIModelConfig,
  InferenceProvider,
  ModelFamily,
} from './ai-models-types.const';

export const GROQ_MODELS: AIModelConfig[] = [
  {
    modelId: 'openai/gpt-oss-120b',
    label: 'GPT-OSS 120B (Groq)',
    description:
      'Large-scale open-source model with ultra-fast inference via Groq',
    modelFamily: ModelFamily.OPENAI,
    inferenceProvider: InferenceProvider.GROQ,
    inputCostPerMillionTokens: 0.15,
    outputCostPerMillionTokens: 0.6,
    cachedInputCostPerMillionTokens: 0.075,
    contextWindowTokens: 128000,
    maxOutputTokens: 16384,
  },
];
