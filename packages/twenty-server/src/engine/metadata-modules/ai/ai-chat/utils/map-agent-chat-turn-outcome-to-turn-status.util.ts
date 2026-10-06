import { assertUnreachable } from 'twenty-shared/utils';

import { type AgentChatTurnOutcome } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-turn-outcome.type';
import { AGENT_TURN_CREDITS_EXHAUSTED_ERROR } from 'src/engine/metadata-modules/ai/ai-history/constants/agent-turn-credits-exhausted-error.constant';
import { type StreamErrorPayload } from 'src/engine/metadata-modules/ai/ai-history/utils/map-error-to-stream-error.util';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';

const FAILURE_ERRORS: Record<
  Exclude<
    Extract<AgentChatTurnOutcome, { kind: 'failed' }>['failurePhase'],
    'execution'
  >,
  StreamErrorPayload
> = {
  no_text: {
    code: 'NO_TEXT',
    message: 'The agent stopped without replying.',
  },
  credits_exhausted: AGENT_TURN_CREDITS_EXHAUSTED_ERROR,
};

export const mapAgentChatTurnOutcomeToTurnStatus = (
  outcome: AgentChatTurnOutcome,
): { status: AgentTurnStatus; error: StreamErrorPayload | null } => {
  switch (outcome.kind) {
    case 'completed':
      return {
        status:
          outcome.outcome === 'awaiting_user'
            ? AgentTurnStatus.WAITING_FOR_INPUT
            : AgentTurnStatus.COMPLETED,
        error: null,
      };
    case 'cancelled':
      return { status: AgentTurnStatus.CANCELLED, error: null };
    case 'failed':
      return {
        status: AgentTurnStatus.FAILED,
        error:
          outcome.failurePhase === 'execution'
            ? {
                code: outcome.errorCode ?? 'EXECUTION_FAILED',
                message: 'The agent failed while running.',
              }
            : FAILURE_ERRORS[outcome.failurePhase],
      };
    default:
      return assertUnreachable(outcome);
  }
};
