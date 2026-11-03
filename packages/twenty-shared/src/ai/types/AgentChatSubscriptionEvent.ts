import { type AgentMessageReactionSummary } from '@/ai/types/AgentMessageReactionSummary';

// Not UIMessageChunk, to keep the `ai` package out of twenty-shared.
export type AgentChatSubscriptionEvent =
  | { type: 'stream-chunk'; chunk: Record<string, unknown>; seq?: number }
  // turnId is set on the reply that ends a turn, not on a member's message
  | { type: 'message-persisted'; messageId: string; turnId?: string }
  // the end of a run without a thread, which saves no message
  | { type: 'run-finished'; turnId: string }
  // A message saved without a turn, which must not reset a reply in progress
  | { type: 'message-added'; messageId: string }
  | { type: 'queue-updated' }
  | { type: 'tool-call-resolved'; toolCallId: string }
  | {
      type: 'message-reactions-updated';
      messageId: string;
      reactions: AgentMessageReactionSummary[];
      revision: number;
    }
  | { type: 'stream-error'; code: string; message: string }
  | { type: 'credits-exhausted'; turnId?: string }
  | {
      type: 'user-credits-exhausted';
      workspaceMemberId: string;
      isFallingBackToWorkspaceCredits: boolean;
      renewsAt: string;
    }
  | { type: 'keepalive' };
