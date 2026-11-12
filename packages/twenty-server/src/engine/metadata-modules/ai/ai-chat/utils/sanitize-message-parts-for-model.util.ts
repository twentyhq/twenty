import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { guideUncallableToolCallsToMetaTool } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/guide-uncallable-tool-calls-to-meta-tool.util';
import { finalizeDanglingToolParts } from 'src/engine/metadata-modules/ai/ai-history/utils/finalize-dangling-tool-parts.util';

// Claude signs thinking over the history before it, which is rebuilt with different content on every turn
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
