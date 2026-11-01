import { type TextStreamPart, type ToolSet } from 'ai';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type AgentRunTurnService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-turn.service';
import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { type AiModelConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-config.type';

export const EMPTY_USAGE = {
  inputTokens: 0,
  outputTokens: 0,
  totalTokens: 0,
  inputTokenDetails: {
    noCacheTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
  },
  outputTokenDetails: { textTokens: 0, reasoningTokens: 0 },
};

export const buildAgentExecutionResult = (
  overrides: Partial<AgentExecutionResult>,
): AgentExecutionResult =>
  ({
    result: { response: '' },
    usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
    cacheCreationTokens: 0,
    nativeWebSearchCallCount: 0,
    stopReason: null,
    modelId: 'test-model',
    steps: [],
    ...overrides,
  }) as AgentExecutionResult;

// a run that called a wait tool, by default a short duration
export const buildWaitingAgentExecutionResult = ({
  toolName = 'wait_for_duration',
  wait = {
    type: 'TIME',
    resumeAt: new Date(Date.now() + 3_000).toISOString(),
  },
}: {
  toolName?: string;
  wait?: Record<string, unknown>;
} = {}): AgentExecutionResult => {
  const output = {
    success: true,
    message: 'Waiting.',
    result: { status: 'pending', wait },
  };

  return buildAgentExecutionResult({
    isPaused: true,
    steps: [
      {
        content: [
          { type: 'tool-call', toolCallId: 'wait-1', toolName, input: {} },
          {
            type: 'tool-result',
            toolCallId: 'wait-1',
            toolName,
            input: {},
            output,
          },
        ],
        toolResults: [{ toolCallId: 'wait-1', toolName, output }],
      },
    ] as unknown as AgentExecutionResult['steps'],
  });
};

const toStreamParts = (
  steps: AgentExecutionResult['steps'],
): TextStreamPart<ToolSet>[] =>
  [
    { type: 'start' },
    ...steps.flatMap((step, stepIndex) => [
      { type: 'start-step', request: {}, warnings: [] },
      ...step.content.flatMap((content, contentIndex): unknown[] => {
        switch (content.type) {
          case 'text': {
            const id = `text-${stepIndex}-${contentIndex}`;

            return [
              { type: 'text-start', id },
              { type: 'text-delta', id, text: content.text },
              { type: 'text-end', id },
            ];
          }
          case 'tool-call':
          case 'tool-result':
            return [content];
          default:
            return [];
        }
      }),
      {
        type: 'finish-step',
        response: {
          id: 'response-id',
          timestamp: new Date(0),
          modelId: 'test',
        },
        usage: EMPTY_USAGE,
        finishReason: 'stop',
        providerMetadata: undefined,
      },
    ]),
    { type: 'finish', finishReason: 'stop', totalUsage: EMPTY_USAGE },
  ] as TextStreamPart<ToolSet>[];

// Each turn streams the reply its steps hold through the real pipeline, and ends as the given
// execution; an error fails the turn as it starts
export const mockAgentRunTurns = (
  ...turns: (AgentExecutionResult | Error)[]
) => {
  const service = getAppProviderByClassName<AgentRunTurnService>(
    'AgentRunTurnService',
  );
  const startTurn = jest.spyOn(service, 'startTurn');
  const completeTurn = jest.spyOn(service, 'completeTurn');

  for (const turn of turns) {
    if (turn instanceof Error) {
      startTurn.mockRejectedValueOnce(turn);

      continue;
    }

    startTurn.mockImplementationOnce(async () => ({
      turn: {} as never,
      spenders: {},
      source: {
        parts: new ReadableStream({
          start: (controller) => {
            toStreamParts(turn.steps ?? []).forEach((part) =>
              controller.enqueue(part),
            );
            controller.close();
          },
        }),
        modelConfig: {
          contextWindowTokens: 100_000,
          inputCostPerMillionTokens: 0,
          outputCostPerMillionTokens: 0,
        } as AiModelConfig,
      },
    }));
    completeTurn.mockResolvedValueOnce({ ...turn, structuredOutputSteps: [] });
  }

  return startTurn;
};
