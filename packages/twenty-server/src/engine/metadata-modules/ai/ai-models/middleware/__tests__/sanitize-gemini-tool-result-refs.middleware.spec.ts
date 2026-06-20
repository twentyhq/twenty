import {
  type LanguageModelV3CallOptions,
  type LanguageModelV3Prompt,
} from '@ai-sdk/provider';

import { sanitizeGeminiToolResultRefsMiddleware } from 'src/engine/metadata-modules/ai/ai-models/middleware/sanitize-gemini-tool-result-refs.middleware';

const transform = async (
  prompt: LanguageModelV3Prompt,
): Promise<LanguageModelV3Prompt> => {
  const result = await sanitizeGeminiToolResultRefsMiddleware.transformParams!({
    type: 'stream',
    params: { prompt } as LanguageModelV3CallOptions,
    model: {} as never,
  });

  return result.prompt;
};

const SCHEMA_WITH_REFS = {
  tools: [
    {
      name: 'find_many_companies',
      inputSchema: {
        type: 'object',
        properties: { filter: { $ref: '#/$defs/__schema0' } },
        $defs: { __schema0: { type: 'object' } },
      },
    },
  ],
};

describe('sanitizeGeminiToolResultRefsMiddleware', () => {
  it('should serialize tool-result json output containing $ref/$defs to text', async () => {
    const prompt: LanguageModelV3Prompt = [
      {
        role: 'tool',
        content: [
          {
            type: 'tool-result',
            toolCallId: 'call-1',
            toolName: 'learn_tools',
            output: { type: 'json', value: SCHEMA_WITH_REFS },
          },
        ],
      },
    ];

    const [message] = await transform(prompt);
    const part = (message.content as any[])[0];

    expect(part.output.type).toBe('text');
    expect(typeof part.output.value).toBe('string');
    expect(JSON.parse(part.output.value)).toEqual(SCHEMA_WITH_REFS);
  });

  it('should convert error-json output containing refs to error-text', async () => {
    const prompt: LanguageModelV3Prompt = [
      {
        role: 'tool',
        content: [
          {
            type: 'tool-result',
            toolCallId: 'call-1',
            toolName: 'learn_tools',
            output: { type: 'error-json', value: SCHEMA_WITH_REFS },
          },
        ],
      },
    ];

    const [message] = await transform(prompt);
    const part = (message.content as any[])[0];

    expect(part.output.type).toBe('error-text');
    expect(JSON.parse(part.output.value)).toEqual(SCHEMA_WITH_REFS);
  });

  it('should leave tool results without refs untouched', async () => {
    const value = { success: true, result: { id: '1', name: 'Acme' } };
    const prompt: LanguageModelV3Prompt = [
      {
        role: 'tool',
        content: [
          {
            type: 'tool-result',
            toolCallId: 'call-1',
            toolName: 'find_one_company',
            output: { type: 'json', value },
          },
        ],
      },
    ];

    const [message] = await transform(prompt);
    const part = (message.content as any[])[0];

    expect(part.output.type).toBe('json');
    expect(part.output.value).toEqual(value);
  });

  it('should not touch non-tool messages', async () => {
    const prompt: LanguageModelV3Prompt = [
      { role: 'system', content: 'You are helpful.' },
      {
        role: 'user',
        content: [{ type: 'text', text: 'hello' }],
      },
    ];

    const result = await transform(prompt);

    expect(result).toEqual(prompt);
  });
});
