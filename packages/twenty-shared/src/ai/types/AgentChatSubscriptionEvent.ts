// Not UIMessageChunk, to keep the `ai` package out of twenty-shared.
export type AgentChatSubscriptionEvent =
  | { type: 'stream-chunk'; chunk: Record<string, unknown>; seq?: number }
  | { type: 'message-persisted'; messageId: string }
  | { type: 'queue-updated' }
  | { type: 'tool-call-resolved'; toolCallId: string }
  | { type: 'stream-error'; code: string; message: string }
  | { type: 'credits-exhausted' }
  | { type: 'keepalive' };
