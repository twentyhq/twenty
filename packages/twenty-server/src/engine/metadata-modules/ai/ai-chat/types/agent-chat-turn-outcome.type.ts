// exactly one per started turn so started = completed + cancelled + failed on dashboards
export type AgentChatTurnOutcome =
  | { kind: 'completed'; outcome: 'answered' | 'awaiting_user' }
  | { kind: 'cancelled'; reason: 'user_cancelled' | 'superseded' }
  | {
      kind: 'failed';
      failurePhase:
        | 'no_text'
        | 'credits_exhausted'
        | 'included_chat_paused'
        | 'execution';
      errorCode?: string;
    };
