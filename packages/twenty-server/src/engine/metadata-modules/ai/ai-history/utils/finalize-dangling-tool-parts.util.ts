import {
  isToolUIPart,
  type UIDataTypes,
  type UIMessagePart,
  type UITools,
} from 'ai';
import { isPlainObject } from 'twenty-shared/utils';

const INTERRUPTED_TOOL_ERROR_TEXT = 'Tool execution was interrupted.';

// A tool part with a nullish or malformed input serializes to an invalid
// `tool_use` block, which Anthropic rejects — bricking every later turn (#21695).
export const finalizeDanglingToolParts = <
  TPart extends UIMessagePart<UIDataTypes, UITools>,
>(
  parts: TPart[],
): TPart[] => {
  const seenToolCallIds = new Set<string>();

  return parts
    .filter((part) => !(isToolUIPart(part) && part.state === 'input-streaming'))
    .filter((part) => {
      if (!isToolUIPart(part)) {
        return true;
      }

      if (seenToolCallIds.has(part.toolCallId)) {
        return false;
      }

      seenToolCallIds.add(part.toolCallId);

      return true;
    })
    .map((part) => {
      if (!isToolUIPart(part)) {
        return part;
      }

      // Dangling call interrupted mid-flight: resolve it as an error.
      if (part.state === 'input-available') {
        return {
          ...part,
          state: 'output-error',
          input: isPlainObject(part.input) ? part.input : {},
          errorText: INTERRUPTED_TOOL_ERROR_TEXT,
        } as TPart;
      }

      // Errored without a usable input (e.g. failed validation or malformed JSON).
      if (part.state === 'output-error' && !isPlainObject(part.input)) {
        return {
          ...part,
          input: {},
        } as TPart;
      }

      return part;
    });
};
