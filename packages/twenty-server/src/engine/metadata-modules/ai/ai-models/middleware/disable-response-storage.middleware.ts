import { type LanguageModelMiddleware } from 'ai';

// Apply at the model boundary so auxiliary calls cannot opt into response storage.
// This does not disable the provider's separate abuse-monitoring retention.
export const createDisableResponseStorageMiddleware = (
  provider: 'azure' | 'openai',
): LanguageModelMiddleware => ({
  specificationVersion: 'v4',
  transformParams: async ({ params }) => ({
    ...params,
    providerOptions: {
      ...params.providerOptions,
      [provider]: {
        ...params.providerOptions?.[provider],
        store: false,
      },
    },
  }),
});
