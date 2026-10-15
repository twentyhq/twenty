import { type LanguageModelV4 } from '@ai-sdk/provider';

import {
  AI_SDK_AZURE,
  AI_SDK_OPENAI,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.const';
import { SdkProviderFactoryService } from 'src/engine/metadata-modules/ai/ai-models/services/sdk-provider-factory.service';

describe('SDK provider response storage', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe.each([
    { npm: AI_SDK_AZURE, provider: 'azure' },
    { npm: AI_SDK_OPENAI, provider: 'openai' },
  ])('$provider', ({ npm, provider }) => {
    it.each(['doGenerate', 'doStream'] as const)(
      '%s sends store: false when callers omit provider options',
      async (method) => {
        const fetchMock = jest
          .spyOn(globalThis, 'fetch')
          .mockRejectedValue(new Error('Stop before sending the request'));
        const factory = new SdkProviderFactoryService();
        const model = factory
          .createProvider('test', {
            npm,
            apiKey: 'test-key',
            baseUrl: 'https://example.invalid',
          })
          .createModel?.('gpt-5') as LanguageModelV4;

        await expect(model[method]({ prompt: [] })).rejects.toBeDefined();

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(JSON.parse(fetchMock.mock.calls[0][1]?.body as string)).toEqual(
          expect.objectContaining({ store: false }),
        );
      },
    );

    it.each(['doGenerate', 'doStream'] as const)(
      '%s overrides store: true while preserving other provider options',
      async (method) => {
        const fetchMock = jest
          .spyOn(globalThis, 'fetch')
          .mockRejectedValue(new Error('Stop before sending the request'));
        const factory = new SdkProviderFactoryService();
        const model = factory
          .createProvider('test', {
            npm,
            apiKey: 'test-key',
            baseUrl: 'https://example.invalid',
          })
          .createModel?.('gpt-5') as LanguageModelV4;

        await expect(
          model[method]({
            prompt: [],
            providerOptions: {
              [provider]: { store: true, parallelToolCalls: false },
            },
          }),
        ).rejects.toBeDefined();

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(JSON.parse(fetchMock.mock.calls[0][1]?.body as string)).toEqual(
          expect.objectContaining({ store: false, parallel_tool_calls: false }),
        );
      },
    );
  });
});
