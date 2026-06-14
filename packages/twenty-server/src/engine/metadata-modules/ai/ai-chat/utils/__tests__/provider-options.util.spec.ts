import {
  getCallLevelProviderOptions,
  getCacheProviderOptions,
  injectCacheBreakpoint,
  mergeProviderOptions,
  withOpenAIStoreDisabledProviderOptions,
} from 'src/engine/metadata-modules/ai/ai-chat/utils/provider-options.util';
import {
  AI_SDK_ANTHROPIC,
  AI_SDK_BEDROCK,
  AI_SDK_OPENAI,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.const';

describe('provider-options.util', () => {
  describe('mergeProviderOptions', () => {
    it('merges provider options without overwriting unrelated providers', () => {
      expect(
        mergeProviderOptions(
          {
            anthropic: {
              cacheControl: { type: 'ephemeral' },
            },
            openai: {
              reasoningEffort: 'medium',
            },
          },
          {
            openai: {
              store: false,
            },
          },
        ),
      ).toEqual({
        anthropic: {
          cacheControl: { type: 'ephemeral' },
        },
        openai: {
          reasoningEffort: 'medium',
          store: false,
        },
      });
    });
  });

  describe('getCallLevelProviderOptions', () => {
    it('returns cache provider options for Anthropic models', () => {
      expect(getCallLevelProviderOptions(AI_SDK_ANTHROPIC)).toEqual({
        anthropic: {
          cacheControl: { type: 'ephemeral' },
        },
      });
    });

    it('merges existing provider options with call-level options', () => {
      expect(
        getCallLevelProviderOptions(AI_SDK_OPENAI, {
          xai: {
            searchParameters: { mode: 'auto' },
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
      expect(getCallLevelProviderOptions(AI_SDK_OPENAI)).toEqual({
        openai: {
          store: false,
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

  describe('withOpenAIStoreDisabledProviderOptions', () => {
    it('adds store false for OpenAI models', () => {
      expect(
        withOpenAIStoreDisabledProviderOptions(AI_SDK_OPENAI, {
          openai: {
            reasoningSummary: 'auto',
          },
        }),
      ).toEqual({
        openai: {
          reasoningSummary: 'auto',
          store: false,
        },
      });
    });

    it('overrides existing OpenAI store options', () => {
      expect(
        withOpenAIStoreDisabledProviderOptions(AI_SDK_OPENAI, {
          openai: {
            store: true,
          },
        }),
      ).toEqual({
        openai: {
          store: false,
        },
      });
    });

    it('does not change non-OpenAI provider options', () => {
      const providerOptions = {
        anthropic: {
          cacheControl: { type: 'ephemeral' },
        },
      };

      expect(
        withOpenAIStoreDisabledProviderOptions(
          AI_SDK_ANTHROPIC,
          providerOptions,
        ),
      ).toBe(providerOptions);
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
