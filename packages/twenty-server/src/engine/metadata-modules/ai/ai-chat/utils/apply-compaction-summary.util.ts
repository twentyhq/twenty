import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { type AgentChatThreadCompactionSummary } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-compaction-summary.type';
import { buildCompactionSummaryMessage } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-compaction-summary-message.util';

export type AppliedCompactionSummary = {
  messages: ExtendedUIMessage[];
  applied: boolean;
};

// Replaces every message up to the persisted watermark with the stored
// summary. A missing watermark (e.g. thread history changed) disables the
// summary instead of risking a hole in the context.
export const applyCompactionSummary = (
  messages: ExtendedUIMessage[],
  compactionSummary: AgentChatThreadCompactionSummary | null,
  threadId: string,
): AppliedCompactionSummary => {
  if (!isDefined(compactionSummary)) {
    return { messages, applied: false };
  }

  const watermarkIndex = messages.findIndex(
    (message) => message.id === compactionSummary.lastCompactedMessageId,
  );

  if (watermarkIndex === -1) {
    return { messages, applied: false };
  }

  return {
    applied: true,
    messages: [
      buildCompactionSummaryMessage(threadId, compactionSummary.text),
      ...messages.slice(watermarkIndex + 1),
    ],
  };
};
