import { type ProviderOptions } from '@ai-sdk/provider-utils';

import { AI_SDK_OPENAI } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.const';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const mergeProviderOptions = (
  providerOptions: ProviderOptions | undefined,
  providerOptionsToMerge: ProviderOptions | undefined,
): ProviderOptions | undefined => {
  if (!providerOptions) {
    return providerOptionsToMerge;
  }

  if (!providerOptionsToMerge) {
    return providerOptions;
  }

  const mergedProviderOptions: Record<string, unknown> = {
    ...providerOptions,
  };

  for (const [providerName, options] of Object.entries(
    providerOptionsToMerge,
  )) {
    const existingOptions = mergedProviderOptions[providerName];

    mergedProviderOptions[providerName] =
      isRecord(existingOptions) && isRecord(options)
        ? { ...existingOptions, ...options }
        : options;
  }

  return mergedProviderOptions as ProviderOptions;
};

export const withOpenAIStoreDisabledProviderOptions = (
  sdkPackage: string,
  providerOptions?: ProviderOptions,
): ProviderOptions | undefined => {
  if (sdkPackage !== AI_SDK_OPENAI) {
    return providerOptions;
  }

  return mergeProviderOptions(providerOptions, {
    openai: {
      store: false,
    },
  });
};
