import {
  getCallLevelProviderOptions,
  getCacheProviderOptions,
  injectCacheBreakpoint,
} from 'src/engine/metadata-modules/ai/ai-chat/utils/provider-options.util';
import {
  AI_SDK_ANTHROPIC,
  AI_SDK_BEDROCK,
  AI_SDK_OPENAI,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.const';

describe('provider-options.util', () => {
  describe('getCallLevelProviderOptions', () => {
    it('returns cache provider options for Anthropic models', () => {
      expect(
        getCallLevelProviderOptions({ sdkPackage: AI_SDK_ANTHROPIC }),
      ).toEqual({
        anthropic: {
          cacheControl: { type: 'ephemeral' },
        },
      });
    });

    it('merges existing provider options with call-level options', () => {
      expect(
        getCallLevelProviderOptions({
          sdkPackage: AI_SDK_OPENAI,
          providerOptions: {
            xai: {
              searchParameters: { mode: 'auto' },
            },
          },
        }),
      ).toEqual({
        xai: {
          searchParameters: { mode: 'auto' },
        },
        openai: {
          store: false,
        },
      });
    });

    it('returns store false for OpenAI models', () => {
      expect(
        getCallLevelProviderOptions({ sdkPackage: AI_SDK_OPENAI }),
      ).toEqual({
        openai: {
          store: false,
        },
      });
    });

    it('includes promptCacheKey for OpenAI when provided', () => {
      expect(
        getCallLevelProviderOptions({
          sdkPackage: AI_SDK_OPENAI,
          promptCacheKey: 'thread-123',
        }),
      ).toEqual({
        openai: {
          store: false,
          promptCacheKey: 'thread-123',
        },
      });
    });

    it('omits promptCacheKey for non-OpenAI providers', () => {
      expect(
        getCallLevelProviderOptions({
          sdkPackage: AI_SDK_ANTHROPIC,
          promptCacheKey: 'thread-123',
        }),
      ).toEqual({
        anthropic: {
          cacheControl: { type: 'ephemeral' },
        },
      });
    });
  });

  describe('getCacheProviderOptions', () => {
    it('returns cache point provider options for Bedrock models', () => {
      expect(getCacheProviderOptions(AI_SDK_BEDROCK)).toEqual({
        bedrock: {
          cachePoint: { type: 'default' },
        },
      });
    });
  });

  describe('injectCacheBreakpoint', () => {
    it('injects cache provider options on the last message only', () => {
      expect(
        injectCacheBreakpoint(
          [
            { role: 'user', content: 'first' },
            {
              role: 'user',
              content: 'last',
              providerOptions: {
                openai: {
                  store: false,
                },
              },
            },
          ],
          AI_SDK_BEDROCK,
        ),
      ).toEqual([
        { role: 'user', content: 'first' },
        {
          role: 'user',
          content: 'last',
          providerOptions: {
            openai: {
              store: false,
            },
            bedrock: {
              cachePoint: { type: 'default' },
            },
          },
        },
      ]);
    });
  });
});
