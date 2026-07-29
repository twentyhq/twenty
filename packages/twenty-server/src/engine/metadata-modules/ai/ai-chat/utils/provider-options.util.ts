import { type ProviderOptions } from '@ai-sdk/provider-utils';
import { type AiSdkPackage } from 'twenty-shared/ai';

import { AI_SDK_AZURE } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.const';

export const getCallLevelProviderOptions = ({
  sdkPackage,
  providerOptions,
}: {
  sdkPackage: AiSdkPackage;
  providerOptions?: ProviderOptions;
}): ProviderOptions | undefined => {
  if (sdkPackage !== AI_SDK_AZURE) {
    return providerOptions;
  }

  return {
    ...(providerOptions ?? {}),
    azure: { store: false },
  };
};
