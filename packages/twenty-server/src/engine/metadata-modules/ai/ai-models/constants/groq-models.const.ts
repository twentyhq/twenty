import { type AIModelConfig, ModelProvider } from './ai-models-types.const';

export const GROQ_MODELS: AIModelConfig[] = [
  {
    modelId: 'openai/gpt-oss-120b',
    label: 'GPT-OSS 120B (Groq)',
    description:
      'Large-scale open-source model with browser search, served via Groq inference',
    provider: ModelProvider.GROQ,
    inputCostPer1kTokensInCents: 0.059,
    outputCostPer1kTokensInCents: 0.079,
    contextWindowTokens: 128000,
    maxOutputTokens: 16384,
  },
];
