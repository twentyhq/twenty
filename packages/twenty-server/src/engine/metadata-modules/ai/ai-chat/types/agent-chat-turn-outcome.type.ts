// Every started turn resolves to exactly one of these so that
// started = completed + cancelled + failed holds on the dashboards.
export type AgentChatTurnOutcome =
  | { kind: 'completed'; outcome: 'answered' | 'awaiting_user' }
  | { kind: 'cancelled'; reason: 'user_cancelled' | 'superseded' }
  | {
      kind: 'failed';
      failurePhase: 'no_text' | 'credits_exhausted' | 'execution';
      errorCode?: string;
    };
