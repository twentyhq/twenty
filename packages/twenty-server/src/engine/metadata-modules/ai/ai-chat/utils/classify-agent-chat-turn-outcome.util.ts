import { type StepDebitResult } from 'src/engine/metadata-modules/ai/ai-billing/types/step-debit-result.type';
import { type AgentChatTurnOutcome } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-turn-outcome.type';

export const classifyAgentChatTurnOutcome = ({
  hasText,
  isAborted,
  isAwaitingUserAnswer,
  stopReason,
}: {
  hasText: boolean;
  isAborted: boolean;
  isAwaitingUserAnswer: boolean;
  stopReason: StepDebitResult['stopReason'];
}): AgentChatTurnOutcome => {
  // stopWhen ends the stream on a question, so this is a completed turn, not an abandoned one
  if (isAwaitingUserAnswer) {
    return { kind: 'completed', outcome: 'awaiting_user' };
  }

  if (isAborted) {
    return { kind: 'cancelled', reason: 'user_cancelled' };
  }

  if (hasText) {
    return { kind: 'completed', outcome: 'answered' };
  }

  if (stopReason === 'userAllowance') {
    return { kind: 'failed', failurePhase: 'user_credits_exhausted' };
  }

  return {
    kind: 'failed',
    failurePhase:
      stopReason === 'workspaceAllowance' ? 'credits_exhausted' : 'no_text',
  };
};

// a lost stream claim overrides completion, but failures keep their phase so an out-of-credits turn
// during a claim handover keeps its billing signal
export const resolveSupersededTurnOutcome = (
  outcome: AgentChatTurnOutcome,
): AgentChatTurnOutcome =>
  outcome.kind === 'failed'
    ? outcome
    : { kind: 'cancelled', reason: 'superseded' };
