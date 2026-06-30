// Provider IDs where the SDK package follows the @ai-sdk/{providerId} pattern.
// Other providers default to @ai-sdk/openai-compatible.
export const NATIVE_AI_SDK_PROVIDER_IDS = [
  'openai',
  'anthropic',
  'google',
  'mistral',
  'xai',
] as const;

export type NativeAiSdkProviderId = (typeof NATIVE_AI_SDK_PROVIDER_IDS)[number];
