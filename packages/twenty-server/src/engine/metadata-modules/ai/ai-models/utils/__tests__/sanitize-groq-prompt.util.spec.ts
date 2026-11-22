import {
  type LanguageModelV4Message,
  type LanguageModelV4Prompt,
} from '@ai-sdk/provider';

import { sanitizeGroqPrompt } from 'src/engine/metadata-modules/ai/ai-models/utils/sanitize-groq-prompt.util';

type LanguageModelV4AssistantMessage = Extract<
  LanguageModelV4Message,
  { role: 'assistant' }
>;

describe('sanitizeGroqPrompt', () => {
  it('omits reasoning parts from assistant messages while preserving text and tool parts', () => {
    const prompt: LanguageModelV4Prompt = [
      {
        role: 'user',
        content: [{ type: 'text', text: 'Remember violet.' }],
      },
      {
        role: 'assistant',
        content: [
          { type: 'reasoning', text: 'The user wants me to remember violet.' },
          { type: 'text', text: 'I will remember violet.' },
        ],
      },
      {
        role: 'user',
        content: [{ type: 'text', text: 'What was the word?' }],
      },
    ];

    const result = sanitizeGroqPrompt(prompt);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual(prompt[0]);
    expect(result[2]).toEqual(prompt[2]);

    const assistant = result[1] as LanguageModelV4AssistantMessage;

    expect(assistant.content).toEqual([
      { type: 'text', text: 'I will remember violet.' },
    ]);
  });

  it('backfills an empty text part when assistant message contains only reasoning parts', () => {
    const prompt: LanguageModelV4Prompt = [
      {
        role: 'assistant',
        content: [
          { type: 'reasoning', text: 'Internal chain of thought without text' },
        ],
      },
    ];

    const result = sanitizeGroqPrompt(prompt);
    const assistant = result[0] as LanguageModelV4AssistantMessage;

    expect(assistant.content).toEqual([{ type: 'text', text: '' }]);
  });

  it('preserves tool calls on assistant message while omitting reasoning parts', () => {
    const prompt: LanguageModelV4Prompt = [
      {
        role: 'assistant',
        content: [
          { type: 'reasoning', text: 'Need to look up company.' },
          {
            type: 'tool-call',
            toolCallId: 'call_1',
            toolName: 'find_company',
            input: { name: 'Acme' },
          },
        ],
      },
    ];

    const result = sanitizeGroqPrompt(prompt);
    const assistant = result[0] as LanguageModelV4AssistantMessage;

    expect(assistant.content).toEqual([
      {
        type: 'tool-call',
        toolCallId: 'call_1',
        toolName: 'find_company',
        input: { name: 'Acme' },
      },
    ]);
  });

  it('leaves system, user, and tool messages untouched', () => {
    const prompt: LanguageModelV4Prompt = [
      {
        role: 'system',
        content: 'You are an AI assistant.',
      },
      {
        role: 'user',
        content: [{ type: 'text', text: 'Hello' }],
      },
      {
        role: 'tool',
        content: [
          {
            type: 'tool-result',
            toolCallId: 'call_1',
            toolName: 'ping',
            output: { type: 'text', value: 'pong' },
          },
        ],
      },
    ];

    const result = sanitizeGroqPrompt(prompt);

    expect(result).toEqual(prompt);
  });
});
