import { type ProviderOptions } from '@ai-sdk/provider-utils';
import { type ModelMessage } from 'ai';
import { type AiSdkPackage } from 'twenty-shared/ai';

import {
  AI_SDK_ANTHROPIC,
  AI_SDK_BEDROCK,
  AI_SDK_OPENAI,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.const';

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

export const getCallLevelCacheProviderOptions = (
  sdkPackage: AiSdkPackage,
): ProviderOptions | undefined => {
  if (sdkPackage === AI_SDK_ANTHROPIC) {
    return { anthropic: { cacheControl: { type: 'ephemeral' } } };
  }

  return undefined;
};

export const getCacheProviderOptions = (
  sdkPackage: AiSdkPackage,
): ProviderOptions | undefined => {
  if (sdkPackage === AI_SDK_BEDROCK) {
    return { bedrock: { cachePoint: { type: 'default' } } };
  }

  return undefined;
};

export const withOpenAIStoreDisabledProviderOptions = (
  sdkPackage: AiSdkPackage,
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

export const getCallLevelProviderOptions = (
  sdkPackage: AiSdkPackage,
  providerOptions?: ProviderOptions,
): ProviderOptions | undefined =>
  withOpenAIStoreDisabledProviderOptions(
    sdkPackage,
    mergeProviderOptions(
      providerOptions,
      getCallLevelCacheProviderOptions(sdkPackage),
    ),
  );

export const injectCacheBreakpoint = (
  messages: ModelMessage[],
  sdkPackage: AiSdkPackage,
): ModelMessage[] => {
  if (messages.length === 0) return messages;

  const cacheOptions = getCacheProviderOptions(sdkPackage);

  if (!cacheOptions) return messages;

  const lastIdx = messages.length - 1;

  return messages.map((message, index) => {
    if (index !== lastIdx) return message;

    return {
      ...message,
      providerOptions: mergeProviderOptions(
        message.providerOptions,
        cacheOptions,
      ),
    };
  });
};
