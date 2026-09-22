import {
  type LanguageModelV4CallOptions,
  type LanguageModelV4StreamPart,
  type LanguageModelV4Usage,
} from '@ai-sdk/provider';
import { isStepCount, streamText, type SystemModelMessage, tool } from 'ai';
import { MockLanguageModelV4, simulateReadableStream } from 'ai/test';
import { z } from 'zod';

import {
  getCacheProviderOptions,
  injectCacheBreakpoint,
} from 'src/engine/metadata-modules/ai/ai-chat/utils/provider-options.util';
import { AI_SDK_BEDROCK } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.const';

const BEDROCK_MAX_CACHE_POINTS = 4;
const TOOL_STEPS = 4;

const usage: LanguageModelV4Usage = {
  inputTokens: { total: 1, noCache: 1, cacheRead: 0, cacheWrite: 0 },
  outputTokens: { total: 1, text: 1, reasoning: 0 },
};

const buildToolCallChunks = (step: number): LanguageModelV4StreamPart[] => [
  { type: 'stream-start', warnings: [] },
  { type: 'tool-input-start', id: `call-${step}`, toolName: 'search' },
  { type: 'tool-input-delta', id: `call-${step}`, delta: '{}' },
  { type: 'tool-input-end', id: `call-${step}` },
  {
    type: 'tool-call',
    toolCallId: `call-${step}`,
    toolName: 'search',
    input: '{}',
  },
  {
    type: 'finish',
    finishReason: { unified: 'tool-calls', raw: 'tool_use' },
    usage,
  },
];

const buildTextChunks = (): LanguageModelV4StreamPart[] => [
  { type: 'stream-start', warnings: [] },
  { type: 'text-start', id: 'text' },
  { type: 'text-delta', id: 'text', delta: 'done' },
  { type: 'text-end', id: 'text' },
  {
    type: 'finish',
    finishReason: { unified: 'stop', raw: 'end_turn' },
    usage,
  },
];

const countCachePoints = (prompt: LanguageModelV4CallOptions['prompt']) =>
  prompt.filter((message) => message.providerOptions?.bedrock?.cachePoint)
    .length;

describe('injectCacheBreakpoint across AI SDK steps', () => {
  beforeAll(() => jest.useRealTimers());

  it('keeps the Bedrock cache point count stable when a turn takes many tool steps', async () => {
    const cachePointsPerStep: number[] = [];
    let stepCount = 0;

    const model = new MockLanguageModelV4({
      doStream: async ({ prompt }) => {
        cachePointsPerStep.push(countCachePoints(prompt));
        stepCount += 1;

        return {
          stream: simulateReadableStream({
            chunks:
              stepCount > TOOL_STEPS
                ? buildTextChunks()
                : buildToolCallChunks(stepCount),
          }),
        };
      },
    });

    const systemMessage: SystemModelMessage = {
      role: 'system',
      content: 'system prompt',
      providerOptions: getCacheProviderOptions(AI_SDK_BEDROCK),
    };

    const stream = streamText({
      model,
      instructions: systemMessage,
      messages: [{ role: 'user', content: 'find my first targets' }],
      tools: {
        search: tool({
          description: 'search records',
          inputSchema: z.object({}),
          execute: async () => 'ok',
        }),
      },
      stopWhen: isStepCount(TOOL_STEPS + 1),
      prepareStep: ({ messages }) => ({
        messages: injectCacheBreakpoint(messages, AI_SDK_BEDROCK),
      }),
    });

    await stream.text;

    expect(
      cachePointsPerStep.every((count) => count <= BEDROCK_MAX_CACHE_POINTS),
    ).toBe(true);
    expect(cachePointsPerStep).toEqual(new Array(TOOL_STEPS + 1).fill(2));
  });
});
