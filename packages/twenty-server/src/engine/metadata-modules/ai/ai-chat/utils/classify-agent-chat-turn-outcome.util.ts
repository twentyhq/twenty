import { type AgentChatTurnOutcome } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-turn-outcome.type';

export const classifyAgentChatTurnOutcome = ({
  hasText,
  isAborted,
  isAwaitingUserAnswer,
  outOfCredits,
}: {
  hasText: boolean;
  isAborted: boolean;
  isAwaitingUserAnswer: boolean;
  outOfCredits: boolean;
}): AgentChatTurnOutcome => {
  // Asking the user a question is how a turn is meant to end when the request is
  // ambiguous, and stopWhen ends the stream on it — so it is a completed turn
  // waiting on an answer, not an abandoned one.
  if (isAwaitingUserAnswer) {
    return { kind: 'completed', outcome: 'awaiting_user' };
  }

  if (isAborted) {
    return { kind: 'cancelled', reason: 'user_cancelled' };
  }

  if (hasText) {
    return { kind: 'completed', outcome: 'answered' };
  }

  return {
    kind: 'failed',
    failurePhase: outOfCredits ? 'credits_exhausted' : 'no_text',
  };
};

// Losing the stream claim says the turn's result may never have reached the
// user, which is worth recording over "completed". It says nothing about a
// failure that already happened, so those keep their own phase — otherwise a
// turn that ran out of credits during a claim handover is filed as a plain
// cancellation and the billing signal disappears.
export const resolveSupersededTurnOutcome = (
  outcome: AgentChatTurnOutcome,
): AgentChatTurnOutcome =>
  outcome.kind === 'failed'
    ? outcome
    : { kind: 'cancelled', reason: 'superseded' };
