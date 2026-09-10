import { type ProviderOptions } from '@ai-sdk/provider-utils';
import { type ModelMessage } from 'ai';
import { type AiSdkPackage } from 'twenty-shared/ai';

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
        anthropic: { cacheControl: { type: 'ephemeral' } },
      };
    case AI_SDK_OPENAI:
      return {
        ...(providerOptions ?? {}),
        openai: { store: false, ...(promptCacheKey ? { promptCacheKey } : {}) },
      };
    case AI_SDK_AZURE:
      return {
        ...(providerOptions ?? {}),
        azure: { store: false },
      };
    default:
      return providerOptions;
  }
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
    if (index !== lastIdx) return message;

    return {
      ...message,
      providerOptions: {
        ...(message.providerOptions ?? {}),
        ...cacheOptions,
      },
    };
  });
};
