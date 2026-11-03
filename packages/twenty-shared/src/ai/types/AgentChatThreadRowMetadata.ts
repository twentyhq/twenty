export type AgentChatThreadRowMetadata = {
  threadId: string;
  activityAt: string | null;
  pendingQuestionMessageId: string | null;
  messageId: string | null;
  previewText: string | null;
  senderType: 'member' | 'assistant' | 'application' | 'workflow' | 'unknown';
  senderId: string | null;
  senderName: string | null;
  executionOutcome: 'finished' | 'failed' | 'cancelled' | 'needsInput' | null;
};
