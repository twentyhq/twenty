import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

import { AI_SDK_OPENAI_COMPATIBLE } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.constant';
import { SdkProviderFactoryService } from 'src/engine/metadata-modules/ai/ai-models/services/sdk-provider-factory.service';
import { type AiProviderConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-config.type';

jest.mock('@ai-sdk/openai-compatible', () => ({
  createOpenAICompatible: jest.fn(),
}));

const mockedCreateOpenAICompatible = jest.mocked(createOpenAICompatible);

const buildOpenAiCompatibleConfig = (
  overrides: Partial<AiProviderConfig> = {},
): AiProviderConfig => ({
  npm: AI_SDK_OPENAI_COMPATIBLE,
  name: 'openai-compatible',
  baseUrl: 'https://api.example.com/v1',
  apiKey: 'test-api-key',
  ...overrides,
});

describe('SdkProviderFactoryService', () => {
  let service: SdkProviderFactoryService;

  beforeEach(() => {
    jest.clearAllMocks();

    mockedCreateOpenAICompatible.mockImplementation((settings) => {
      const provider = ((modelId: string) => ({
        modelId,
        settings,
      })) as unknown as ReturnType<typeof createOpenAICompatible>;

      return provider;
    });

    service = new SdkProviderFactoryService();
  });

  describe('buildOpenAiCompatibleProvider', () => {
    it('strips reasoning_content from historical assistant messages for Groq', async () => {
      service.createProvider(
        'groq',
        buildOpenAiCompatibleConfig({
          name: 'groq',
          baseUrl: 'https://api.groq.com/openai/v1',
        }),
      );

      expect(mockedCreateOpenAICompatible).toHaveBeenCalledTimes(1);

      const settings = mockedCreateOpenAICompatible.mock.calls[0][0];

      expect(settings.transformRequestBody).toBeDefined();

      const requestBody = {
        model: 'openai/gpt-oss-120b',
        messages: [
          {
            role: 'user',
            content: 'Remember the word violet. Reply with that word.',
          },
          {
            role: 'assistant',
            content: 'violet',
            reasoning_content: 'The user asked me to remember violet.',
          },
          {
            role: 'user',
            content: 'What was the word?',
          },
        ],
      };

      const transformedRequestBody = await Promise.resolve(
        settings.transformRequestBody?.({
          requestBody,
          request: {} as never,
        }),
      );

      expect(transformedRequestBody).toEqual({
        model: 'openai/gpt-oss-120b',
        messages: [
          {
            role: 'user',
            content: 'Remember the word violet. Reply with that word.',
          },
          {
            role: 'assistant',
            content: 'violet',
          },
          {
            role: 'user',
            content: 'What was the word?',
          },
        ],
      });
    });

    it('does not mutate the original request body when stripping Groq reasoning_content', async () => {
      service.createProvider(
        'groq',
        buildOpenAiCompatibleConfig({
          name: 'groq',
          baseUrl: 'https://api.groq.com/openai/v1',
        }),
      );

      const settings = mockedCreateOpenAICompatible.mock.calls[0][0];
      const requestBody = {
        messages: [
          {
            role: 'assistant',
            content: 'violet',
            reasoning_content: 'The user asked me to remember violet.',
          },
        ],
      };

      await Promise.resolve(
        settings.transformRequestBody?.({
          requestBody,
          request: {} as never,
        }),
      );

      expect(requestBody).toEqual({
        messages: [
          {
            role: 'assistant',
            content: 'violet',
            reasoning_content: 'The user asked me to remember violet.',
          },
        ],
      });
    });

    it('does not add a Groq transform for non-Groq OpenAI-compatible providers', () => {
      service.createProvider(
        'openai-compatible',
        buildOpenAiCompatibleConfig({
          name: 'openai-compatible',
          baseUrl: 'https://api.example.com/v1',
        }),
      );

      expect(mockedCreateOpenAICompatible).toHaveBeenCalledTimes(1);

      const settings = mockedCreateOpenAICompatible.mock.calls[0][0];

      expect(settings.transformRequestBody).toBeUndefined();
    });

    it('keeps reasoning_content for non-Groq OpenAI-compatible payloads', () => {
      service.createProvider(
        'openai-compatible',
        buildOpenAiCompatibleConfig({
          name: 'openai-compatible',
          baseUrl: 'https://api.example.com/v1',
        }),
      );

      const settings = mockedCreateOpenAICompatible.mock.calls[0][0];
      const requestBody = {
        messages: [
          {
            role: 'assistant',
            content: 'violet',
            reasoning_content: 'The user asked me to remember violet.',
          },
        ],
      };

      const transformedRequestBody = settings.transformRequestBody
        ? settings.transformRequestBody({
            requestBody,
            request: {} as never,
          })
        : requestBody;

      expect(transformedRequestBody).toEqual({
        messages: [
          {
            role: 'assistant',
            content: 'violet',
            reasoning_content: 'The user asked me to remember violet.',
          },
        ],
      });
    });
  });
});
