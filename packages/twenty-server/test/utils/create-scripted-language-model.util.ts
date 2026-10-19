import {
  type LanguageModelV4CallOptions,
  type LanguageModelV4StreamPart,
} from '@ai-sdk/provider';
import { convertArrayToReadableStream, MockLanguageModelV4 } from 'ai/test';
import { type ScriptedModelResponse } from 'test/utils/scripted-model-response.type';

const toStreamParts = (
  { content, finishReason, usage, streamError }: ScriptedModelResponse,
  callIndex: number,
): LanguageModelV4StreamPart[] => [
  { type: 'stream-start', warnings: [] },
  ...content.flatMap((part, partIndex): LanguageModelV4StreamPart[] => {
    const id = `${callIndex}-${partIndex}`;

    switch (part.type) {
      case 'text':
        return [
          { type: 'text-start', id },
          { type: 'text-delta', id, delta: part.text },
          { type: 'text-end', id },
        ];
      case 'reasoning':
        return [
          { type: 'reasoning-start', id },
          { type: 'reasoning-delta', id, delta: part.text },
          { type: 'reasoning-end', id },
        ];
      default:
        return [part];
    }
  }),
  streamError === undefined
    ? { type: 'finish', finishReason, usage }
    : { type: 'error', error: streamError },
];

// Agent runs stream their steps, so a mock model answers both generate and stream calls from one script
export const createScriptedLanguageModel = (
  respond: (
    options: LanguageModelV4CallOptions,
    callIndex: number,
  ) => ScriptedModelResponse | Promise<ScriptedModelResponse>,
): MockLanguageModelV4 => {
  let callCount = 0;

  return new MockLanguageModelV4({
    doGenerate: async (options) => {
      const { streamError, ...response } = await respond(options, callCount++);

      if (streamError !== undefined) {
        throw streamError;
      }

      return { ...response, warnings: [] };
    },
    doStream: async (options) => {
      const callIndex = callCount++;

      return {
        stream: convertArrayToReadableStream(
          toStreamParts(await respond(options, callIndex), callIndex),
        ),
      };
    },
  });
};
