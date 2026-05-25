import {
  mergeProviderOptions,
  withOpenAIStoreDisabledProviderOptions,
} from 'src/engine/metadata-modules/ai/ai-chat/utils/openai-provider-options.util';
import {
  AI_SDK_ANTHROPIC,
  AI_SDK_OPENAI,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.const';

describe('openai-provider-options.util', () => {
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
});
