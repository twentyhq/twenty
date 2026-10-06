import { isNonEmptyString } from '@sniptt/guards';
import { getToolName, isToolUIPart } from 'ai';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { isAwaitingPausingToolOutput } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/is-awaiting-pausing-tool-output.util';
import { parsePausingToolCall } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/parse-pausing-tool-call.util';

export const findAwaitingCallText = (
  parts: ExtendedUIMessagePart[],
): string | null =>
  parts
    .flatMap((part) => {
      // A call that failed was never shown to the member
      if (!isToolUIPart(part) || !isAwaitingPausingToolOutput(part.output)) {
        return [];
      }

      const text = parsePausingToolCall({
        toolName: getToolName(part),
        toolInput: part.input,
        toolOutput: part.output,
      })
        ?.preview()
        ?.trim();

      return isNonEmptyString(text) ? [text] : [];
    })
    .pop() ?? null;
