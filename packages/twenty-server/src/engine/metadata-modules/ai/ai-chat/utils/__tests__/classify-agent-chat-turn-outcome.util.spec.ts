import { classifyAgentChatTurnOutcome } from 'src/engine/metadata-modules/ai/ai-chat/utils/classify-agent-chat-turn-outcome.util';

const baseTurn = {
  hasText: true,
  isAborted: false,
  isAwaitingUserAnswer: false,
  outOfCredits: false,
};

describe('classifyAgentChatTurnOutcome', () => {
  it('counts a turn that replied with text as answered', () => {
    expect(classifyAgentChatTurnOutcome(baseTurn)).toEqual({
      kind: 'completed',
      outcome: 'answered',
    });
  });

  it('counts a turn that ended on a question as completed, not abandoned', () => {
    expect(
      classifyAgentChatTurnOutcome({
        ...baseTurn,
        hasText: false,
        isAwaitingUserAnswer: true,
      }),
    ).toEqual({ kind: 'completed', outcome: 'awaiting_user' });
  });

  it('keeps a question asked mid-cancellation as awaiting the user', () => {
    expect(
      classifyAgentChatTurnOutcome({
        ...baseTurn,
        isAborted: true,
        isAwaitingUserAnswer: true,
      }),
    ).toEqual({ kind: 'completed', outcome: 'awaiting_user' });
  });

  it('counts a cancelled turn as cancelled rather than failed', () => {
    expect(
      classifyAgentChatTurnOutcome({
        ...baseTurn,
        hasText: false,
        isAborted: true,
      }),
    ).toEqual({ kind: 'cancelled', reason: 'user_cancelled' });
  });

  it('counts an empty reply as a no_text failure', () => {
    expect(
      classifyAgentChatTurnOutcome({ ...baseTurn, hasText: false }),
    ).toEqual({ kind: 'failed', failurePhase: 'no_text' });
  });

  it('separates running out of credits from an empty reply', () => {
    expect(
      classifyAgentChatTurnOutcome({
        ...baseTurn,
        hasText: false,
        outOfCredits: true,
      }),
    ).toEqual({ kind: 'failed', failurePhase: 'credits_exhausted' });
  });

  it('still counts a turn that produced text before credits ran out as answered', () => {
    expect(
      classifyAgentChatTurnOutcome({ ...baseTurn, outOfCredits: true }),
    ).toEqual({ kind: 'completed', outcome: 'answered' });
  });
});
