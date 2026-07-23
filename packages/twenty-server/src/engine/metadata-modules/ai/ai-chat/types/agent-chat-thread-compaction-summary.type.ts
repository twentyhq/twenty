export type AgentChatThreadCompactionSummary = {
  text: string;
  // Id of the last thread message covered by the summary; messages up to and
  // including it are replaced by the summary when building the model context.
  lastCompactedMessageId: string;
  compactedAt: string;
};
