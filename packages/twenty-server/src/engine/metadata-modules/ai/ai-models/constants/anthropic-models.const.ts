import { type AIModelConfig, ModelProvider } from './ai-models-types.const';

export const ANTHROPIC_MODELS: AIModelConfig[] = [
  // Active models
  {
    modelId: 'claude-opus-4-5-20251101',
    label: 'Claude Opus 4.5',
    description:
      'Most powerful Claude model excelling in complex reasoning, coding, and agentic tasks',
    provider: ModelProvider.ANTHROPIC,
    inputCostPer1kTokensInCents: 0.5,
    outputCostPer1kTokensInCents: 2.5,
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
  {
    modelId: 'claude-sonnet-4-5-20250929',
    label: 'Claude Sonnet 4.5',
    description:
      'Advanced model for coding tasks and complex agent-based workflows with 1M context',
    provider: ModelProvider.ANTHROPIC,
    inputCostPer1kTokensInCents: 0.3,
    outputCostPer1kTokensInCents: 1.5,
    contextWindowTokens: 1000000,
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
  {
    modelId: 'claude-haiku-4-5-20251001',
    label: 'Claude Haiku 4.5',
    description:
      'Fast and cost-effective model optimized for high-speed processing',
    provider: ModelProvider.ANTHROPIC,
    inputCostPer1kTokensInCents: 0.1,
    outputCostPer1kTokensInCents: 0.5,
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
    doesSupportThinking: false,
    nativeCapabilities: {
      webSearch: true,
    },
  },
  {
    modelId: 'claude-3-5-haiku-20241022',
    label: 'Claude Haiku 3.5',
    description:
      'Fast and efficient model optimized for speed and cost-effectiveness',
    provider: ModelProvider.ANTHROPIC,
    inputCostPer1kTokensInCents: 0.08,
    outputCostPer1kTokensInCents: 0.4,
    contextWindowTokens: 200000,
    maxOutputTokens: 8192,
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
    doesSupportThinking: false,
    nativeCapabilities: {
      webSearch: true,
    },
  },

  // Deprecated models - kept for backward compatibility with existing agents
  {
    modelId: 'claude-opus-4-20250514',
    label: 'Claude Opus 4',
    description:
      'Most powerful Claude model with extended thinking for complex reasoning tasks',
    provider: ModelProvider.ANTHROPIC,
    inputCostPer1kTokensInCents: 1.5,
    outputCostPer1kTokensInCents: 7.5,
    contextWindowTokens: 200000,
    maxOutputTokens: 8192,
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
    deprecated: true,
  },
  {
    modelId: 'claude-sonnet-4-20250514',
    label: 'Claude Sonnet 4',
    description:
      'Balanced model with strong performance and extended thinking capabilities',
    provider: ModelProvider.ANTHROPIC,
    inputCostPer1kTokensInCents: 0.3,
    outputCostPer1kTokensInCents: 1.5,
    contextWindowTokens: 200000,
    maxOutputTokens: 8192,
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
    deprecated: true,
  },
];
