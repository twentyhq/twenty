import { isNonEmptyString } from '@sniptt/guards';

import { AI_SDK_OPENAI_COMPATIBLE } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.constant';
import { type AiProviderConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-config.type';

export const isGroqOpenAiCompatible = (
  config: AiProviderConfig,
  providerName?: string,
): boolean => {
  if (config.npm !== AI_SDK_OPENAI_COMPATIBLE) {
    return false;
  }

  const baseUrl = isNonEmptyString(config.baseUrl)
    ? config.baseUrl.toLowerCase()
    : '';
  const name = isNonEmptyString(config.name) ? config.name.toLowerCase() : '';
  const normalizedProviderName = isNonEmptyString(providerName)
    ? providerName.toLowerCase()
    : '';

  const isGroqIdentifier = (val: string) =>
    val === 'groq' || val.startsWith('groq-');

  return (
    baseUrl.includes('groq.com') ||
    isGroqIdentifier(name) ||
    isGroqIdentifier(normalizedProviderName)
  );
};
