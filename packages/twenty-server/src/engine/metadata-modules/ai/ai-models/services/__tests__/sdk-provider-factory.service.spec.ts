import { wrapLanguageModel } from 'ai';

import { AI_SDK_OPENAI_COMPATIBLE } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.constant';
import { sanitizeGroqAssistantReasoningMiddleware } from 'src/engine/metadata-modules/ai/ai-models/middleware/sanitize-groq-assistant-reasoning.middleware';
import { SdkProviderFactoryService } from 'src/engine/metadata-modules/ai/ai-models/services/sdk-provider-factory.service';

jest.mock('ai', () => ({
  ...jest.requireActual('ai'),
  wrapLanguageModel: jest.fn(({ model }) => model),
}));

jest.mock('@ai-sdk/openai-compatible', () => ({
  createOpenAICompatible: jest.fn(() =>
    jest.fn((modelId: string) => ({
      modelId,
      provider: 'openai-compatible',
    })),
  ),
}));

describe('SdkProviderFactoryService', () => {
  let factory: SdkProviderFactoryService;

  beforeEach(() => {
    jest.clearAllMocks();
    factory = new SdkProviderFactoryService();
  });

  describe('OpenAI-compatible with Groq', () => {
    it('wraps language model with sanitizeGroqAssistantReasoningMiddleware for Groq baseUrl', () => {
      const instance = factory.createProvider('groq-provider', {
        npm: AI_SDK_OPENAI_COMPATIBLE,
        baseUrl: 'https://api.groq.com/openai/v1',
        apiKey: 'gsk_test',
      });

      expect(instance.createModel).toBeDefined();
      instance.createModel?.('openai/gpt-oss-120b');

      expect(wrapLanguageModel).toHaveBeenCalledTimes(1);
      expect(wrapLanguageModel).toHaveBeenCalledWith({
        model: expect.objectContaining({
          modelId: 'openai/gpt-oss-120b',
        }),
        middleware: sanitizeGroqAssistantReasoningMiddleware,
      });
    });

    it('wraps language model when providerName indicates Groq even if proxy baseUrl is used and name is unset', () => {
      const instance = factory.createProvider('groq', {
        npm: AI_SDK_OPENAI_COMPATIBLE,
        baseUrl: 'https://proxy.internal/v1',
        apiKey: 'proxy_test',
      });

      expect(instance.createModel).toBeDefined();
      instance.createModel?.('llama-3.3-70b-versatile');

      expect(wrapLanguageModel).toHaveBeenCalledTimes(1);
      expect(wrapLanguageModel).toHaveBeenCalledWith({
        model: expect.objectContaining({
          modelId: 'llama-3.3-70b-versatile',
        }),
        middleware: sanitizeGroqAssistantReasoningMiddleware,
      });
    });

    it('does not wrap language model with Groq middleware for non-Groq OpenAI-compatible endpoints', () => {
      const instance = factory.createProvider('together-provider', {
        npm: AI_SDK_OPENAI_COMPATIBLE,
        baseUrl: 'https://api.together.xyz/v1',
        apiKey: 'together_test',
      });

      expect(instance.createModel).toBeDefined();
      instance.createModel?.('deepseek-ai/DeepSeek-R1');

      expect(wrapLanguageModel).not.toHaveBeenCalled();
    });
  });
});
