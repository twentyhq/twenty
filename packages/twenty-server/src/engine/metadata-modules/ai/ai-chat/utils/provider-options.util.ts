import { type ProviderOptions } from '@ai-sdk/provider-utils';
import { type ModelMessage } from 'ai';
import { type AiSdkPackage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import {
  AI_SDK_ANTHROPIC,
  AI_SDK_AZURE,
  AI_SDK_BEDROCK,
  AI_SDK_OPENAI,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.const';

export const getCacheProviderOptions = (
  sdkPackage: AiSdkPackage,
): ProviderOptions | undefined => {
  switch (sdkPackage) {
    case AI_SDK_BEDROCK:
      return { bedrock: { cachePoint: { type: 'default' } } };
    default:
      return undefined;
  }
};
export const getCallLevelProviderOptions = ({
  sdkPackage,
  providerOptions,
  promptCacheKey,
}: {
  sdkPackage: AiSdkPackage;
  providerOptions?: ProviderOptions;
  promptCacheKey?: string;
}): ProviderOptions | undefined => {
  switch (sdkPackage) {
    case AI_SDK_ANTHROPIC:
      return {
        ...(providerOptions ?? {}),
        anthropic: {
          ...(providerOptions?.anthropic ?? {}),
          cacheControl: { type: 'ephemeral' },
        },
      };
    case AI_SDK_OPENAI:
      return {
        ...(providerOptions ?? {}),
        openai: {
          ...(providerOptions?.openai ?? {}),
          store: false,
          ...(promptCacheKey ? { promptCacheKey } : {}),
        },
      };
    case AI_SDK_AZURE:
      return {
        ...(providerOptions ?? {}),
        azure: { ...(providerOptions?.azure ?? {}), store: false },
      };
    default:
      return providerOptions;
  }
};

const omitCacheProviderOptions = (
  providerOptions: ProviderOptions | undefined,
  cacheOptions: ProviderOptions,
): ProviderOptions | undefined => {
  if (!isDefined(providerOptions)) return undefined;

  const remainingProviderOptions = Object.entries(
    providerOptions,
  ).reduce<ProviderOptions>((accumulator, [namespace, options]) => {
    const cacheKeys = Object.keys(cacheOptions[namespace] ?? {});
    const remainingOptions = Object.fromEntries(
      Object.entries(options).filter(([key]) => !cacheKeys.includes(key)),
    );

    return Object.keys(remainingOptions).length === 0
      ? accumulator
      : { ...accumulator, [namespace]: remainingOptions };
  }, {});

  return Object.keys(remainingProviderOptions).length === 0
    ? undefined
    : remainingProviderOptions;
};

export const injectCacheBreakpoint = (
  messages: ModelMessage[],
  sdkPackage: AiSdkPackage,
): ModelMessage[] => {
  if (messages.length === 0) return messages;

  const cacheOptions = getCacheProviderOptions(sdkPackage);

  if (!cacheOptions) return messages;

  const lastIdx = messages.length - 1;

  return messages.map((message, index) => {
    const providerOptions = omitCacheProviderOptions(
      message.providerOptions,
      cacheOptions,
    );

    if (index !== lastIdx) return { ...message, providerOptions };

    return {
      ...message,
      providerOptions: Object.entries(cacheOptions).reduce<ProviderOptions>(
        (accumulator, [namespace, options]) => ({
          ...accumulator,
          [namespace]: { ...(accumulator[namespace] ?? {}), ...options },
        }),
        providerOptions ?? {},
      ),
    };
  });
};
