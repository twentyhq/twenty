// exactly one per started turn so started = completed + cancelled + failed on dashboards
export type AgentChatTurnOutcome =
  | { kind: 'completed'; outcome: 'answered' | 'awaiting_user' | 'silent' }
  | { kind: 'cancelled'; reason: 'user_cancelled' | 'superseded' }
  | {
      kind: 'failed';
      failurePhase:
        | 'no_text'
        | 'credits_exhausted'
        | 'user_credits_exhausted'
        | 'execution';
      errorCode?: string;
    };
