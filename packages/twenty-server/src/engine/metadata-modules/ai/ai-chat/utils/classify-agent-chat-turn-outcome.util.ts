import { isDefined } from 'twenty-shared/utils';

import { type StepDebitResult } from 'src/engine/metadata-modules/ai/ai-billing/types/step-debit-result.type';
import { type AgentChatTurnOutcome } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-turn-outcome.type';

const CREDITS_FAILURE_PHASE = {
  userAllowance: 'user_credits_exhausted',
  workspaceAllowance: 'credits_exhausted',
} as const satisfies Record<NonNullable<StepDebitResult['stopReason']>, string>;

export const classifyAgentChatTurnOutcome = ({
  hasText,
  isAborted,
  isAwaitingUserAnswer,
  isSilent,
  stopReason,
  isTextReplyRequired = true,
}: {
  hasText: boolean;
  isAborted: boolean;
  isAwaitingUserAnswer: boolean;
  isSilent: boolean;
  stopReason: StepDebitResult['stopReason'];
  isTextReplyRequired?: boolean;
}): AgentChatTurnOutcome => {
  // stopWhen ends the stream on a question, so this is a completed turn, not an abandoned one
  if (isAwaitingUserAnswer) {
    return { kind: 'completed', outcome: 'awaiting_user' };
  }

  if (isAborted) {
    return { kind: 'cancelled', reason: 'user_cancelled' };
  }

  // a background run that ran out of credits fails, whatever it wrote before
  if (!isTextReplyRequired && isDefined(stopReason)) {
    return { kind: 'failed', failurePhase: CREDITS_FAILURE_PHASE[stopReason] };
  }

  if (hasText) {
    return { kind: 'completed', outcome: 'answered' };
  }

  if (isSilent) {
    return { kind: 'completed', outcome: 'silent' };
  }

  // a background run's outcome is its result, so it may end on tool calls without a written reply
  if (!isTextReplyRequired) {
    return { kind: 'completed', outcome: 'answered' };
  }

  return {
    kind: 'failed',
    failurePhase: isDefined(stopReason)
      ? CREDITS_FAILURE_PHASE[stopReason]
      : 'no_text',
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
