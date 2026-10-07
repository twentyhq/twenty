import { mapAgentChatTurnOutcomeToTurnStatus } from 'src/engine/metadata-modules/ai/ai-chat/utils/map-agent-chat-turn-outcome-to-turn-status.util';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';

describe('mapAgentChatTurnOutcomeToTurnStatus', () => {
  it('completes an answered turn', () => {
    expect(
      mapAgentChatTurnOutcomeToTurnStatus({
        kind: 'completed',
        outcome: 'answered',
      }),
    ).toEqual({ status: AgentTurnStatus.COMPLETED, error: null });
  });

  it('leaves a turn that asked a question waiting for its answer', () => {
    expect(
      mapAgentChatTurnOutcomeToTurnStatus({
        kind: 'completed',
        outcome: 'awaiting_user',
      }),
    ).toEqual({ status: AgentTurnStatus.WAITING_FOR_INPUT, error: null });
  });

  it('cancels a turn the member stopped', () => {
    expect(
      mapAgentChatTurnOutcomeToTurnStatus({
        kind: 'cancelled',
        reason: 'user_cancelled',
      }),
    ).toEqual({ status: AgentTurnStatus.CANCELLED, error: null });
  });

  it('fails a turn that ran out of credits with a readable error', () => {
    expect(
      mapAgentChatTurnOutcomeToTurnStatus({
        kind: 'failed',
        failurePhase: 'credits_exhausted',
      }),
    ).toEqual({
      status: AgentTurnStatus.FAILED,
      error: expect.objectContaining({ code: 'CREDITS_EXHAUSTED' }),
    });
  });

  it('fails a turn the fair-use ceiling stopped with the pause error the chat renders', () => {
    expect(
      mapAgentChatTurnOutcomeToTurnStatus({
        kind: 'failed',
        failurePhase: 'included_chat_paused',
      }),
    ).toEqual({
      status: AgentTurnStatus.FAILED,
      error: expect.objectContaining({ code: 'INCLUDED_CHAT_PAUSED' }),
    });
  });

  it('keeps the error code of a turn that failed while running', () => {
    expect(
      mapAgentChatTurnOutcomeToTurnStatus({
        kind: 'failed',
        failurePhase: 'execution',
        errorCode: 'STREAM_INTERRUPTED',
      }),
    ).toEqual({
      status: AgentTurnStatus.FAILED,
      error: expect.objectContaining({ code: 'STREAM_INTERRUPTED' }),
    });
  });
});
