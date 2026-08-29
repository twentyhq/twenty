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
