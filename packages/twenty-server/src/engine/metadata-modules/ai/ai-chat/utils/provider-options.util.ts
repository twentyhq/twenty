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

const BEDROCK_CACHE_POINT = { cachePoint: { type: 'default' } };

export const getCacheProviderOptions = (
  sdkPackage: AiSdkPackage,
): ProviderOptions | undefined => {
  switch (sdkPackage) {
    case AI_SDK_BEDROCK:
      return { bedrock: { ...BEDROCK_CACHE_POINT } };
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

const omitBedrockCachePoint = (
  providerOptions: ProviderOptions | undefined,
): ProviderOptions | undefined => {
  const bedrock = providerOptions?.bedrock;

  if (!isDefined(providerOptions) || !isDefined(bedrock)) {
    return providerOptions;
  }

  const { bedrock: _bedrock, ...otherProviderOptions } = providerOptions;
  const { cachePoint: _cachePoint, ...otherBedrockOptions } = bedrock;

  if (Object.keys(otherBedrockOptions).length > 0) {
    return { ...otherProviderOptions, bedrock: otherBedrockOptions };
  }

  if (Object.keys(otherProviderOptions).length > 0) {
    return otherProviderOptions;
  }

  return undefined;
};

export const injectCacheBreakpoint = (
  messages: ModelMessage[],
  sdkPackage: AiSdkPackage,
): ModelMessage[] => {
  if (messages.length === 0 || sdkPackage !== AI_SDK_BEDROCK) return messages;

  const lastIdx = messages.length - 1;

  return messages.map((message, index) => {
    const providerOptions = omitBedrockCachePoint(message.providerOptions);

    if (index !== lastIdx) return { ...message, providerOptions };

    return {
      ...message,
      providerOptions: {
        ...providerOptions,
        bedrock: { ...providerOptions?.bedrock, ...BEDROCK_CACHE_POINT },
      },
    };
  });
};
