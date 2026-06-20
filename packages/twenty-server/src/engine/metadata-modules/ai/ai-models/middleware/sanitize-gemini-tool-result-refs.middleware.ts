import {
  type LanguageModelV3Prompt,
  type LanguageModelV3ToolResultPart,
} from '@ai-sdk/provider';
import { isObject } from '@sniptt/guards';
import { type LanguageModelMiddleware } from 'ai';

const containsJsonSchemaDefsRef = (value: unknown): boolean => {
  if (Array.isArray(value)) {
    return value.some(containsJsonSchemaDefsRef);
  }

  if (!isObject(value)) {
    return false;
  }

  if (('$ref' in value && typeof value.$ref === 'string') || '$defs' in value) {
    return true;
  }

  return Object.values(value).some(containsJsonSchemaDefsRef);
};

const sanitizeToolResultPart = (
  part: LanguageModelV3ToolResultPart,
): LanguageModelV3ToolResultPart => {
  if (
    (part.output.type !== 'json' && part.output.type !== 'error-json') ||
    !containsJsonSchemaDefsRef(part.output.value)
  ) {
    return part;
  }

  return {
    ...part,
    output:
      part.output.type === 'error-json'
        ? { type: 'error-text', value: JSON.stringify(part.output.value) }
        : { type: 'text', value: JSON.stringify(part.output.value) },
  };
};

const sanitizePrompt = (prompt: LanguageModelV3Prompt): LanguageModelV3Prompt =>
  prompt.map((message) =>
    message.role === 'tool'
      ? { ...message, content: message.content.map(sanitizeToolResultPart) }
      : message,
  );

/* Gemini rejects JSON Schema `$ref`/`$defs` pointers inside function-response
 content with a 400 (it resolves `$ref` against function declaration names).
 Our tool results can carry such schemas (e.g. `learn_tools` returns input
 schemas built from recursive z.lazy() filter schemas), so we serialize those
 results to text before they reach Gemini. Scoped to Google only; other
 providers accept the pointers as-is. */
export const sanitizeGeminiToolResultRefsMiddleware: LanguageModelMiddleware = {
  specificationVersion: 'v3',
  transformParams: async ({ params }) => ({
    ...params,
    prompt: sanitizePrompt(params.prompt),
  }),
};
