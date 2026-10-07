import { isToolUIPart } from 'ai';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';
import { isPlainObject } from 'twenty-shared/utils';

import { isAwaitingPausingToolOutput } from 'src/engine/metadata-modules/ai/ai-history/utils/is-awaiting-pausing-tool-output.util';

// A pending call a caller waits on is marked, so a chat message cannot close it and its
// answer goes to the caller instead of starting a chat turn. The answer replaces the mark
export const stampPendingToolPartsAwaitedByCaller = (
  parts: ExtendedUIMessagePart[],
): ExtendedUIMessagePart[] =>
  parts.map((part) =>
    isToolUIPart(part) &&
    isPlainObject(part.output) &&
    isAwaitingPausingToolOutput(part.output)
      ? ({
          ...part,
          output: { ...part.output, awaitedByCaller: true },
        } as ExtendedUIMessagePart)
      : part,
  );
