export const MODELS_DEV_API_URL = 'https://models.dev/api.json';

// AI SDK follows @ai-sdk/{provider-id} for these providers.
// Everything else defaults to @ai-sdk/openai-compatible.
export const KNOWN_SDK_PROVIDERS = [
  'openai',
  'anthropic',
  'google',
  'mistral',
  'xai',
] as const;

export const inferNpmPackage = (providerId: string): string =>
  (KNOWN_SDK_PROVIDERS as readonly string[]).includes(providerId)
    ? `@ai-sdk/${providerId}`
    : '@ai-sdk/openai-compatible';
