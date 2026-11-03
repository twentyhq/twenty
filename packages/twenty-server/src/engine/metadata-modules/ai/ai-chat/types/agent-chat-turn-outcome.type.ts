import { type AgentChatTurnCancellationReason } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-turn-cancellation-reason.enum';

// exactly one per started turn so started = completed + cancelled + failed on dashboards
export type AgentChatTurnOutcome =
  | { kind: 'completed'; outcome: 'answered' | 'awaiting_user' | 'silent' }
  | {
      kind: 'cancelled';
      reason: AgentChatTurnCancellationReason;
    }
  | {
      kind: 'failed';
      failurePhase:
        | 'no_text'
        | 'credits_exhausted'
        | 'user_credits_exhausted'
        | 'execution';
      errorCode?: string;
    };
