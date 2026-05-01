import { type ModelMessage } from 'ai';
import { type ProviderOptions } from '@ai-sdk/provider-utils';

import {
  AI_SDK_ANTHROPIC,
  AI_SDK_BEDROCK,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.const';

export const getCallLevelCacheProviderOptions = (
  sdkPackage: string,
): ProviderOptions | undefined => {
  if (sdkPackage === AI_SDK_ANTHROPIC) {
    return { anthropic: { cacheControl: { type: 'ephemeral' } } };
  }

  return undefined;
};

export const getCacheProviderOptions = (
  sdkPackage: string,
): ProviderOptions | undefined => {
  if (sdkPackage === AI_SDK_BEDROCK) {
    return { bedrock: { cachePoint: { type: 'default' } } };
  }

  return undefined;
};

export const injectCacheBreakpoint = (
  messages: ModelMessage[],
  sdkPackage: string,
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
