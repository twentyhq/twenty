import { type LanguageModelMiddleware } from 'ai';

import { sanitizeToolResultRefs } from 'src/engine/metadata-modules/ai/ai-models/utils/sanitize-tool-result-refs.util';

// Gemini 400s on JSON Schema `$ref`/`$defs` in tool results, so serialize them to text (Google only): https://github.com/vercel/ai/issues/14369
export const sanitizeGeminiToolResultRefsMiddleware: LanguageModelMiddleware = {
  specificationVersion: 'v3',
  transformParams: async ({ params }) => ({
    ...params,
    prompt: sanitizeToolResultRefs(params.prompt),
  }),
};
