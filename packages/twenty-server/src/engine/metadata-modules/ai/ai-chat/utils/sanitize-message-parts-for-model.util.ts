import {
  type ExtendedUIMessage,
  type ExtendedUIMessagePart,
} from 'twenty-shared/ai';

import { guideUncallableToolCallsToMetaTool } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/guide-uncallable-tool-calls-to-meta-tool.util';
import { finalizeDanglingToolParts } from 'src/engine/metadata-modules/ai/ai-history/utils/finalize-dangling-tool-parts.util';

// Historical reasoning blocks from completed turns cause signature mismatch errors
// on Anthropic Claude when preceding context shifts (e.g. browsing_context, #29356).
// Omitting them from history sent to the model prevents signature errors and saves tokens.
const stripHistoricalReasoningParts = (
  parts: ExtendedUIMessagePart[],
  role: ExtendedUIMessage['role'],
): ExtendedUIMessagePart[] => {
  const partsWithoutReasoning = parts.filter(
    (part) => part.type !== 'reasoning',
  );

  if (role === 'assistant' && partsWithoutReasoning.length === 0) {
    return [{ type: 'text', text: '' }];
  }

  return partsWithoutReasoning;
};

export const sanitizeMessagePartsForModel = (
  messages: ExtendedUIMessage[],
  directlyCallableToolNames: Set<string>,
): ExtendedUIMessage[] =>
  messages.map((message) => ({
    ...message,
    parts: guideUncallableToolCallsToMetaTool(
      finalizeDanglingToolParts(
        stripHistoricalReasoningParts(message.parts, message.role),
      ),
      directlyCallableToolNames,
    ),
  }));
