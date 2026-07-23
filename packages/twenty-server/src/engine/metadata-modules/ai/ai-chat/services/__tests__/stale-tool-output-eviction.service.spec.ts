import { convertToModelMessages } from 'ai';
import {
  type ExtendedUIMessage,
  type ExtendedUIMessagePart,
} from 'twenty-shared/ai';

import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import {
  EVICTED_SPILLED_TOOL_OUTPUT_MESSAGE,
  EVICTED_TOOL_OUTPUT_MESSAGE,
} from 'src/engine/metadata-modules/ai/ai-chat/constants/stale-tool-output-eviction.const';
import { StaleToolOutputEvictionService } from 'src/engine/metadata-modules/ai/ai-chat/services/stale-tool-output-eviction.service';

const buildService = (evictionEnabled = true) => {
  const twentyConfigService = {
    get: jest.fn().mockReturnValue(evictionEnabled),
  };

  return {
    service: new StaleToolOutputEvictionService(
      twentyConfigService as unknown as TwentyConfigService,
    ),
    twentyConfigService,
  };
};

// estimateToolOutputTokens uses raw length / 4 for string outputs.
const outputOfTokens = (tokens: number): string => 'x'.repeat(tokens * 4);

const userMessage = (id: string, text: string): ExtendedUIMessage =>
  ({
    id,
    role: 'user',
    parts: [{ type: 'text', text }],
  }) as ExtendedUIMessage;

const assistantMessage = (
  id: string,
  parts: ExtendedUIMessagePart[],
): ExtendedUIMessage =>
  ({
    id,
    role: 'assistant',
    parts,
  }) as ExtendedUIMessage;

const toolOutputPart = (
  toolCallId: string,
  output: unknown,
  overrides: Record<string, unknown> = {},
): ExtendedUIMessagePart =>
  ({
    type: 'tool-search_records',
    toolCallId,
    state: 'output-available',
    input: {},
    output,
    ...overrides,
  }) as unknown as ExtendedUIMessagePart;

const partOutput = (
  message: ExtendedUIMessage,
  partIndex: number,
): unknown => (message.parts[partIndex] as { output?: unknown }).output;

const unresolvedToolCallIds = async (
  messages: ExtendedUIMessage[],
): Promise<string[]> => {
  const modelMessages = await convertToModelMessages(messages);
  const pending = new Set<string>();

  for (const message of modelMessages) {
    if (!Array.isArray(message.content)) {
      continue;
    }

    for (const content of message.content) {
      if (typeof content !== 'object') {
        continue;
      }

      if (content.type === 'tool-call' && content.providerExecuted !== true) {
        pending.add(content.toolCallId);
      }

      if (content.type === 'tool-result') {
        pending.delete(content.toolCallId);
      }
    }
  }

  return [...pending];
};

const countToolResults = async (
  messages: ExtendedUIMessage[],
): Promise<number> => {
  const modelMessages = await convertToModelMessages(messages);

  return modelMessages
    .filter((message) => message.role === 'tool')
    .flatMap((message) =>
      Array.isArray(message.content) ? message.content : [],
    )
    .filter((content) => content.type === 'tool-result').length;
};

// user-1 + assistant-1 are outside the last 2 user turns; everything from
// user-2 onward is protected.
const buildThreeTurnThread = (
  oldAssistantParts: ExtendedUIMessagePart[],
  recentAssistantParts: ExtendedUIMessagePart[] = [],
): ExtendedUIMessage[] => [
  userMessage('user-1', 'find my biggest deals'),
  assistantMessage('assistant-1', oldAssistantParts),
  userMessage('user-2', 'now filter by region'),
  assistantMessage('assistant-2', recentAssistantParts),
  userMessage('user-3', 'and sort by amount'),
];

describe('StaleToolOutputEvictionService', () => {
  describe('no-op guards', () => {
    it('should return messages untouched when the flag is disabled', () => {
      const { service, twentyConfigService } = buildService(false);
      const messages = buildThreeTurnThread([
        toolOutputPart('call-1', outputOfTokens(50_000)),
        toolOutputPart('call-2', outputOfTokens(50_000)),
      ]);

      const result = service.evictStaleToolOutputs(messages);

      expect(result.messages).toBe(messages);
      expect(result.evictedToolOutputCount).toBe(0);
      expect(twentyConfigService.get).toHaveBeenCalledWith(
        'AI_CHAT_STALE_TOOL_OUTPUT_EVICTION_ENABLED',
      );
    });

    it('should do nothing when the thread has fewer than 3 user turns', () => {
      const { service } = buildService();
      const messages = [
        userMessage('user-1', 'hello'),
        assistantMessage('assistant-1', [
          toolOutputPart('call-1', outputOfTokens(100_000)),
          toolOutputPart('call-2', outputOfTokens(100_000)),
        ]),
        userMessage('user-2', 'go on'),
        assistantMessage('assistant-2', []),
      ];

      const result = service.evictStaleToolOutputs(messages);

      expect(result.messages).toBe(messages);
      expect(result.evictedToolOutputCount).toBe(0);
    });

    it('should do nothing when reclaimable tokens are under the minimum', () => {
      const { service } = buildService();
      // Newest→oldest accumulation: 15k, 30k (protected) then 45k — only the
      // oldest 15k output is beyond the 40k window, below the 20k minimum.
      const messages = buildThreeTurnThread([
        toolOutputPart('call-1', outputOfTokens(15_000)),
        toolOutputPart('call-2', outputOfTokens(15_000)),
        toolOutputPart('call-3', outputOfTokens(15_000)),
      ]);

      const result = service.evictStaleToolOutputs(messages);

      expect(result.messages).toBe(messages);
      expect(result.evictedToolOutputCount).toBe(0);
      expect(result.reclaimedTokens).toBe(0);
    });
  });

  describe('protected window and minimum reclaim boundaries', () => {
    it('should evict only outputs beyond the newest 40k tokens and evict when exactly 20k is reclaimable', () => {
      const { service } = buildService();
      // Reverse walk: 20k (protected), 40k (still protected, not > 40k),
      // 60k (candidate). Reclaimable is exactly 20k, which is enough.
      const messages = buildThreeTurnThread([
        toolOutputPart('call-oldest', outputOfTokens(20_000)),
        toolOutputPart('call-middle', outputOfTokens(20_000)),
        toolOutputPart('call-newest', outputOfTokens(20_000)),
      ]);

      const result = service.evictStaleToolOutputs(messages);

      expect(result.evictedToolOutputCount).toBe(1);
      expect(result.reclaimedTokens).toBe(20_000);

      const oldAssistant = result.messages[1];

      expect(partOutput(oldAssistant, 0)).toEqual({
        evicted: true,
        success: true,
        message: EVICTED_TOOL_OUTPUT_MESSAGE,
      });
      expect(oldAssistant.parts[1]).toBe(messages[1].parts[1]);
      expect(oldAssistant.parts[2]).toBe(messages[1].parts[2]);
    });

    it('should evict a single output larger than the whole protected window', () => {
      const { service } = buildService();
      const messages = buildThreeTurnThread([
        toolOutputPart('call-huge', outputOfTokens(50_000)),
      ]);

      const result = service.evictStaleToolOutputs(messages);

      expect(result.evictedToolOutputCount).toBe(1);
      expect(result.reclaimedTokens).toBe(50_000);
      expect(partOutput(result.messages[1], 0)).toEqual({
        evicted: true,
        success: true,
        message: EVICTED_TOOL_OUTPUT_MESSAGE,
      });
    });
  });

  describe('last 2 user turns are skipped', () => {
    it('should never touch outputs inside the last 2 user turns, however large', () => {
      const { service } = buildService();
      const hugeRecentOutput = outputOfTokens(100_000);
      const messages = buildThreeTurnThread(
        [
          toolOutputPart('call-old-1', outputOfTokens(25_000)),
          toolOutputPart('call-old-2', outputOfTokens(25_000)),
        ],
        [toolOutputPart('call-recent', hugeRecentOutput)],
      );

      const result = service.evictStaleToolOutputs(messages);

      expect(result.evictedToolOutputCount).toBe(1);
      expect(partOutput(result.messages[1], 0)).toEqual(
        expect.objectContaining({ evicted: true }),
      );
      expect(partOutput(result.messages[1], 1)).toBe(
        partOutput(messages[1], 1),
      );
      expect(partOutput(result.messages[3], 0)).toBe(hugeRecentOutput);
    });

    it('should not consume the protected window with outputs from the last 2 user turns', () => {
      const { service } = buildService();
      // The 100k recent output would blow the 40k window if counted; the two
      // old outputs alone stay within it, so nothing is evicted.
      const messages = buildThreeTurnThread(
        [
          toolOutputPart('call-old-1', outputOfTokens(19_000)),
          toolOutputPart('call-old-2', outputOfTokens(19_000)),
        ],
        [toolOutputPart('call-recent', outputOfTokens(100_000))],
      );

      const result = service.evictStaleToolOutputs(messages);

      expect(result.messages).toBe(messages);
      expect(result.evictedToolOutputCount).toBe(0);
    });
  });

  describe('stub shape', () => {
    it('should replace a plain output with a compact marker stub preserving part identity', () => {
      const { service } = buildService();
      const messages = buildThreeTurnThread([
        toolOutputPart('call-plain', outputOfTokens(50_000)),
      ]);

      const result = service.evictStaleToolOutputs(messages);
      const evictedPart = result.messages[1].parts[0] as {
        type: string;
        toolCallId: string;
        state: string;
        input: unknown;
        output: unknown;
      };

      expect(evictedPart.type).toBe('tool-search_records');
      expect(evictedPart.toolCallId).toBe('call-plain');
      expect(evictedPart.state).toBe('output-available');
      expect(evictedPart.input).toEqual({});
      expect(evictedPart.output).toEqual({
        evicted: true,
        success: true,
        message: EVICTED_TOOL_OUTPUT_MESSAGE,
      });
    });

    it('should keep the spill outputRef and point to the navigation tools for spilled outputs', () => {
      const { service } = buildService();
      const spilledOutput = {
        success: true,
        message: 'Found 5000 records',
        result: {
          spilled: true,
          outputRef: {
            fileId: 'file-123',
            filename: 'tool-output-search_records-file-123.json',
          },
          preview: outputOfTokens(50_000),
          hint: 'Output too large to inline.',
        },
      };
      const messages = buildThreeTurnThread([
        toolOutputPart('call-spilled', spilledOutput),
      ]);

      const result = service.evictStaleToolOutputs(messages);
      const stub = partOutput(result.messages[1], 0) as {
        evicted: boolean;
        success: boolean;
        message: string;
        result: { spilled: boolean; outputRef: unknown; hint: string };
      };

      expect(stub.evicted).toBe(true);
      expect(stub.success).toBe(true);
      expect(stub.message).toBe(EVICTED_SPILLED_TOOL_OUTPUT_MESSAGE);
      expect(stub.result.spilled).toBe(true);
      expect(stub.result.outputRef).toEqual({
        fileId: 'file-123',
        filename: 'tool-output-search_records-file-123.json',
      });
      expect(stub.result.hint).toContain('file-123');
      expect(stub.result.hint).toContain('search_output');
      expect(stub.result.hint).toContain('extract_json_paths');
      expect(JSON.stringify(stub)).not.toContain('xxxx');
    });

    it('should preserve a false success flag on the stub', () => {
      const { service } = buildService();
      const failedOutput = {
        success: false,
        message: 'boom',
        error: outputOfTokens(50_000),
      };
      const messages = buildThreeTurnThread([
        toolOutputPart('call-failed', failedOutput),
      ]);

      const result = service.evictStaleToolOutputs(messages);

      expect(partOutput(result.messages[1], 0)).toEqual({
        evicted: true,
        success: false,
        message: EVICTED_TOOL_OUTPUT_MESSAGE,
      });
    });
  });

  describe('exemptions', () => {
    it('should never evict ask_questions outputs', () => {
      const { service } = buildService();
      const askQuestionsOutput = {
        success: true,
        message: 'Questions presented to the user.',
        result: { answers: outputOfTokens(50_000) },
      };
      const messages = buildThreeTurnThread([
        toolOutputPart('call-ask', askQuestionsOutput, {
          type: 'tool-ask_questions',
        }),
        toolOutputPart('call-old', outputOfTokens(25_000)),
        toolOutputPart('call-new', outputOfTokens(25_000)),
      ]);

      const result = service.evictStaleToolOutputs(messages);

      expect(result.evictedToolOutputCount).toBe(1);
      expect(partOutput(result.messages[1], 0)).toBe(askQuestionsOutput);
      expect(partOutput(result.messages[1], 1)).toEqual(
        expect.objectContaining({ evicted: true }),
      );
      expect(partOutput(result.messages[1], 2)).toBe(
        partOutput(messages[1], 2),
      );
    });

    it('should not count ask_questions outputs against the protected window', () => {
      const { service } = buildService();
      // Without the exemption the 50k ask_questions output would push the
      // oldest 25k output past the 40k window.
      const messages = buildThreeTurnThread([
        toolOutputPart('call-old', outputOfTokens(25_000)),
        toolOutputPart(
          'call-ask',
          { success: true, result: outputOfTokens(50_000) },
          { type: 'tool-ask_questions' },
        ),
        toolOutputPart('call-new', outputOfTokens(15_000)),
      ]);

      const result = service.evictStaleToolOutputs(messages);

      expect(result.messages).toBe(messages);
      expect(result.evictedToolOutputCount).toBe(0);
    });

    it('should skip provider-executed tool outputs', () => {
      const { service } = buildService();
      const providerOutput = outputOfTokens(100_000);
      const messages = buildThreeTurnThread([
        toolOutputPart('call-provider', providerOutput, {
          providerExecuted: true,
        }),
      ]);

      const result = service.evictStaleToolOutputs(messages);

      expect(result.messages).toBe(messages);
      expect(partOutput(result.messages[1], 0)).toBe(providerOutput);
    });

    it('should leave output-error parts untouched', () => {
      const { service } = buildService();
      const erroredPart = {
        type: 'tool-search_records',
        toolCallId: 'call-error',
        state: 'output-error',
        input: {},
        errorText: outputOfTokens(100_000),
      } as unknown as ExtendedUIMessagePart;
      const messages = buildThreeTurnThread([
        erroredPart,
        toolOutputPart('call-old', outputOfTokens(25_000)),
        toolOutputPart('call-new', outputOfTokens(25_000)),
      ]);

      const result = service.evictStaleToolOutputs(messages);

      expect(result.evictedToolOutputCount).toBe(1);
      expect(result.messages[1].parts[0]).toBe(erroredPart);
    });

    it('should not re-evict an already evicted stub', () => {
      const { service } = buildService();
      const existingStub = {
        evicted: true,
        success: true,
        message: EVICTED_TOOL_OUTPUT_MESSAGE,
      };
      const messages = buildThreeTurnThread([
        toolOutputPart('call-stub', existingStub),
        toolOutputPart('call-old', outputOfTokens(25_000)),
        toolOutputPart('call-new', outputOfTokens(25_000)),
      ]);

      const result = service.evictStaleToolOutputs(messages);

      expect(result.evictedToolOutputCount).toBe(1);
      expect(partOutput(result.messages[1], 0)).toBe(existingStub);
    });
  });

  describe('pairing integrity and immutability', () => {
    it('should keep every tool call resolved after eviction', async () => {
      const { service } = buildService();
      const messages = buildThreeTurnThread(
        [
          toolOutputPart('call-1', outputOfTokens(25_000)),
          toolOutputPart('call-2', outputOfTokens(25_000)),
          toolOutputPart('call-3', outputOfTokens(25_000)),
        ],
        [toolOutputPart('call-recent', outputOfTokens(5_000))],
      );

      const result = service.evictStaleToolOutputs(messages);

      expect(result.evictedToolOutputCount).toBeGreaterThan(0);
      expect(await unresolvedToolCallIds(result.messages)).toEqual([]);
      expect(await countToolResults(result.messages)).toBe(
        await countToolResults(messages),
      );
    });

    it('should serialize the stub as the tool result value in model messages', async () => {
      const { service } = buildService();
      const messages = buildThreeTurnThread([
        toolOutputPart('call-huge', outputOfTokens(60_000)),
      ]);

      const result = service.evictStaleToolOutputs(messages);
      const modelMessages = await convertToModelMessages(result.messages);
      const toolResults = modelMessages
        .filter((message) => message.role === 'tool')
        .flatMap((message) =>
          Array.isArray(message.content) ? message.content : [],
        );

      expect(toolResults).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            toolCallId: 'call-huge',
            output: expect.objectContaining({
              value: expect.objectContaining({ evicted: true }),
            }),
          }),
        ]),
      );
    });

    it('should never mutate the input messages', () => {
      const { service } = buildService();
      const messages = buildThreeTurnThread([
        toolOutputPart('call-1', outputOfTokens(30_000)),
        toolOutputPart('call-2', outputOfTokens(30_000)),
        toolOutputPart('call-3', outputOfTokens(30_000)),
      ]);
      const snapshot = structuredClone(messages);

      const result = service.evictStaleToolOutputs(messages);

      expect(result.evictedToolOutputCount).toBeGreaterThan(0);
      expect(messages).toEqual(snapshot);
    });
  });
});
