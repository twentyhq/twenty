import { type ExtendedUIMessage } from 'twenty-shared/ai';

const COMPACTION_SUMMARY_MESSAGE_ID_PREFIX = 'compaction-summary-';

export const getCompactionSummaryMessageId = (threadId: string): string =>
  `${COMPACTION_SUMMARY_MESSAGE_ID_PREFIX}${threadId}`;

export const isCompactionSummaryMessage = (
  message: ExtendedUIMessage,
): boolean => message.id.startsWith(COMPACTION_SUMMARY_MESSAGE_ID_PREFIX);

// The summary replaces the compacted prefix as a user-role message, the
// integration pattern used by Codex, Goose and Crush.
export const buildCompactionSummaryMessage = (
  threadId: string,
  summaryText: string,
): ExtendedUIMessage => ({
  id: getCompactionSummaryMessageId(threadId),
  role: 'user',
  parts: [
    {
      type: 'text',
      text: `The earlier part of this conversation was replaced by the structured summary below. Treat it as accurate shared context and continue the conversation naturally from it; do not bring it up unless the user asks.\n\n<conversation_summary>\n${summaryText}\n</conversation_summary>`,
    },
  ],
});
