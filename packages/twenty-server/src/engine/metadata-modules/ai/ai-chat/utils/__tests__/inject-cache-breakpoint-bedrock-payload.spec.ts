import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { generateText, isStepCount, tool } from 'ai';
import { z } from 'zod';

import {
  getCacheProviderOptions,
  injectCacheBreakpoint,
} from 'src/engine/metadata-modules/ai/ai-chat/utils/provider-options.util';
import { AI_SDK_BEDROCK } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.const';

const BEDROCK_MAX_CACHE_POINTS = 4;
const TOOL_STEPS = 4;

type ConverseBlock = Record<string, unknown>;
type ConverseBody = {
  system?: ConverseBlock[];
  messages?: { role: string; content?: ConverseBlock[] }[];
  toolConfig?: { tools?: ConverseBlock[] };
};

const countCachePoints = (blocks: ConverseBlock[] = []) =>
  blocks.filter((block) => 'cachePoint' in block).length;

const countPayloadCachePoints = (body: ConverseBody) =>
  countCachePoints(body.system) +
  countCachePoints(body.toolConfig?.tools) +
  (body.messages ?? []).reduce(
    (total, message) => total + countCachePoints(message.content),
    0,
  );

describe('injectCacheBreakpoint against the Bedrock Converse payload', () => {
  beforeAll(() => jest.useRealTimers());

  it('never sends more cache points than Bedrock accepts, however many tool steps a turn takes', async () => {
    const cachePointsPerCall: number[] = [];
    const payloads: ConverseBody[] = [];
    let call = 0;

    const bedrock = createAmazonBedrock({
      region: 'us-west-2',
      accessKeyId: 'test-access-key-id',
      secretAccessKey: 'test-secret-access-key',
      fetch: (async (_url: string, init: { body: string }) => {
        const body: ConverseBody = JSON.parse(init.body);

        payloads.push(body);
        cachePointsPerCall.push(countPayloadCachePoints(body));
        call += 1;

        const isLastCall = call > TOOL_STEPS;

        return new Response(
          JSON.stringify({
            output: {
              message: {
                role: 'assistant',
                content: isLastCall
                  ? [{ text: 'done' }]
                  : [
                      {
                        toolUse: {
                          toolUseId: `call-${call}`,
                          name: 'search',
                          input: {},
                        },
                      },
                    ],
              },
            },
            stopReason: isLastCall ? 'end_turn' : 'tool_use',
            usage: { inputTokens: 10, outputTokens: 5, totalTokens: 15 },
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        );
      }) as typeof fetch,
    });

    await generateText({
      model: bedrock('us.anthropic.claude-sonnet-5'),
      instructions: {
        role: 'system',
        content: 'system prompt',
        providerOptions: getCacheProviderOptions(AI_SDK_BEDROCK),
      },
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

    expect(
      cachePointsPerCall.every((count) => count <= BEDROCK_MAX_CACHE_POINTS),
    ).toBe(true);
    expect(cachePointsPerCall).toEqual(new Array(TOOL_STEPS + 1).fill(2));

    const lastPayload = payloads[payloads.length - 1];
    const messages = lastPayload.messages ?? [];

    expect(countCachePoints(lastPayload.system)).toBe(1);
    expect(
      messages.slice(0, -1).flatMap((message) => message.content ?? []),
    ).not.toContainEqual({ cachePoint: { type: 'default' } });
    expect(messages[messages.length - 1].content).toContainEqual({
      cachePoint: { type: 'default' },
    });
  });
});
