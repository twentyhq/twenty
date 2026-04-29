// `chunk` is typed as Record<string, unknown> rather than UIMessageChunk
// to avoid importing the `ai` package in twenty-shared. The frontend casts
// it back to UIMessageChunk when feeding it into readUIMessageStream.
export type AgentChatSubscriptionEvent =
  | { type: 'stream-chunk'; chunk: Record<string, unknown>; seq?: number }
  | { type: 'message-persisted'; messageId: string }
  | { type: 'queue-updated' }
  | { type: 'stream-error'; code: string; message: string };
