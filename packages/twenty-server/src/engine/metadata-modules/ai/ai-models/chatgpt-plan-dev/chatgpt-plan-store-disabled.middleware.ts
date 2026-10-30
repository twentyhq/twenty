import { type LanguageModelMiddleware } from 'ai';

// The plan route only serves unstored responses. Telling the SDK (rather than
// only rewriting the request) makes it resend reasoning as encrypted content
// instead of item references that an unstored response cannot resolve.
export const chatGptPlanStoreDisabledMiddleware: LanguageModelMiddleware = {
  specificationVersion: 'v4',
  transformParams: async ({ params }) => ({
    ...params,
    providerOptions: {
      ...params.providerOptions,
      openai: {
        ...params.providerOptions?.openai,
        store: false,
      },
    },
  }),
};
