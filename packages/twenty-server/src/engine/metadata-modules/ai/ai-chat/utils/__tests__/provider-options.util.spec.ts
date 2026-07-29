import { getCallLevelProviderOptions } from 'src/engine/metadata-modules/ai/ai-chat/utils/provider-options.util';
import {
  AI_SDK_ANTHROPIC,
  AI_SDK_AZURE,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.const';

describe('provider-options.util', () => {
  it('disables Responses API storage for Azure models', () => {
    expect(getCallLevelProviderOptions({ sdkPackage: AI_SDK_AZURE })).toEqual({
      azure: { store: false },
    });
  });

  it('preserves provider options for non-Azure models', () => {
    const providerOptions = {
      anthropic: { cacheControl: { type: 'ephemeral' } },
    } as const;

    expect(
      getCallLevelProviderOptions({
        sdkPackage: AI_SDK_ANTHROPIC,
        providerOptions,
      }),
    ).toBe(providerOptions);
  });
});
