import {
  classifyAgentChatTurnOutcome,
  resolveSupersededTurnOutcome,
} from 'src/engine/metadata-modules/ai/ai-chat/utils/classify-agent-chat-turn-outcome.util';

const baseTurn = {
  hasText: true,
  isAborted: false,
  isAwaitingUserAnswer: false,
  isSilent: false,
  stopReason: null,
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

  it('counts a turn that chose not to reply as silent rather than failed', () => {
    expect(
      classifyAgentChatTurnOutcome({
        ...baseTurn,
        hasText: false,
        isSilent: true,
      }),
    ).toEqual({ kind: 'completed', outcome: 'silent' });
  });

  it('counts a reply as answered even when it also chose silence', () => {
    expect(
      classifyAgentChatTurnOutcome({ ...baseTurn, isSilent: true }),
    ).toEqual({ kind: 'completed', outcome: 'answered' });
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
        stopReason: 'workspaceAllowance',
      }),
    ).toEqual({ kind: 'failed', failurePhase: 'credits_exhausted' });
  });

  it('separates a member running out of their own credits from the workspace running out', () => {
    expect(
      classifyAgentChatTurnOutcome({
        ...baseTurn,
        hasText: false,
        stopReason: 'userAllowance',
      }),
    ).toEqual({ kind: 'failed', failurePhase: 'user_credits_exhausted' });
  });

  it('still counts a turn that produced text before the user credits ran out as answered', () => {
    expect(
      classifyAgentChatTurnOutcome({
        ...baseTurn,
        stopReason: 'userAllowance',
      }),
    ).toEqual({ kind: 'completed', outcome: 'answered' });
  });

  it('still counts a turn that produced text before credits ran out as answered', () => {
    expect(
      classifyAgentChatTurnOutcome({
        ...baseTurn,
        stopReason: 'workspaceAllowance',
      }),
    ).toEqual({ kind: 'completed', outcome: 'answered' });
  });
});

describe('classifyAgentChatTurnOutcome for a background run', () => {
  const runTurn = {
    hasText: false,
    isAborted: false,
    isAwaitingUserAnswer: false,
    isSilent: false,
    isTextReplyRequired: false,
  };

  it('completes a run that ends on tool calls without writing a reply', () => {
    expect(
      classifyAgentChatTurnOutcome({ ...runTurn, stopReason: null }),
    ).toEqual({ kind: 'completed', outcome: 'answered' });
  });

  it('still fails a run that ran out of credits before writing anything', () => {
    expect(
      classifyAgentChatTurnOutcome({
        ...runTurn,
        stopReason: 'workspaceAllowance',
      }),
    ).toEqual({ kind: 'failed', failurePhase: 'credits_exhausted' });
  });

  it('fails a run that ran out of credits even after writing a reply', () => {
    expect(
      classifyAgentChatTurnOutcome({
        ...runTurn,
        hasText: true,
        stopReason: 'workspaceAllowance',
      }),
    ).toEqual({ kind: 'failed', failurePhase: 'credits_exhausted' });
  });
});

describe('resolveSupersededTurnOutcome', () => {
  it('keeps a credits failure rather than filing it as a cancellation', () => {
    expect(
      resolveSupersededTurnOutcome({
        kind: 'failed',
        failurePhase: 'credits_exhausted',
      }),
    ).toEqual({ kind: 'failed', failurePhase: 'credits_exhausted' });
  });

  it('keeps a no_text failure', () => {
    expect(
      resolveSupersededTurnOutcome({ kind: 'failed', failurePhase: 'no_text' }),
    ).toEqual({ kind: 'failed', failurePhase: 'no_text' });
  });

  it('supersedes a completed turn, whose answer may never have landed', () => {
    expect(
      resolveSupersededTurnOutcome({ kind: 'completed', outcome: 'answered' }),
    ).toEqual({ kind: 'cancelled', reason: 'superseded' });
  });

  it('supersedes a turn that was awaiting a user answer', () => {
    expect(
      resolveSupersededTurnOutcome({
        kind: 'completed',
        outcome: 'awaiting_user',
      }),
    ).toEqual({ kind: 'cancelled', reason: 'superseded' });
  });

  it('supersedes a user cancellation', () => {
    expect(
      resolveSupersededTurnOutcome({
        kind: 'cancelled',
        reason: 'user_cancelled',
      }),
    ).toEqual({ kind: 'cancelled', reason: 'superseded' });
  });
});
