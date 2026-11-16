import { type LanguageModelMiddleware } from 'ai';

import { sanitizeGroqPrompt } from 'src/engine/metadata-modules/ai/ai-models/utils/sanitize-groq-prompt.util';

// Groq 400s when replaying assistant messages with reasoning_content (#30436).
export const sanitizeGroqAssistantReasoningMiddleware: LanguageModelMiddleware =
  {
    specificationVersion: 'v4',
    transformParams: async ({ params }) => ({
      ...params,
      prompt: sanitizeGroqPrompt(params.prompt),
    }),
  };
