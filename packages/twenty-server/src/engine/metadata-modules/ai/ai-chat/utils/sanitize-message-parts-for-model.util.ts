import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { guideUncallableToolCallsToMetaTool } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/guide-uncallable-tool-calls-to-meta-tool.util';
import { finalizeDanglingToolParts } from 'src/engine/metadata-modules/ai/ai-history/utils/finalize-dangling-tool-parts.util';

export const sanitizeMessagePartsForModel = (
  messages: ExtendedUIMessage[],
  directlyCallableToolNames: Set<string>,
): ExtendedUIMessage[] =>
  messages.map((message) => ({
    ...message,
    parts: guideUncallableToolCallsToMetaTool(
      finalizeDanglingToolParts(
        message.parts.filter((part) => part.type !== 'reasoning'),
      ),
      directlyCallableToolNames,
    ),
  }));
