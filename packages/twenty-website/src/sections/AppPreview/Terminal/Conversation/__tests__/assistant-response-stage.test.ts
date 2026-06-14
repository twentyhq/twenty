import {
  ASSISTANT_RESPONSE_STAGE_DELAYS,
  getAssistantResponseStageTransition,
  hasAssistantResponseStageReached,
} from '../utils/assistant-response-stage';

describe('assistant-response-stage', () => {
  it('reports whether a stage has already been reached', () => {
    expect(
      hasAssistantResponseStageReached({
        currentStage: 'payload',
        targetStage: 'launch',
      }),
    ).toBe(true);

    expect(
      hasAssistantResponseStageReached({
        currentStage: 'launch',
        targetStage: 'payload',
      }),
    ).toBe(false);
  });

  it('returns deterministic transitions for streamed response stages', () => {
    expect(getAssistantResponseStageTransition('rocket')).toEqual({
      delayMs: ASSISTANT_RESPONSE_STAGE_DELAYS.afterObjectBeatMs,
      nextStage: 'launch',
    });

    expect(getAssistantResponseStageTransition('launchSite')).toEqual({
      delayMs: ASSISTANT_RESPONSE_STAGE_DELAYS.betweenParagraphsMs,
      nextStage: 'actions',
    });

    expect(getAssistantResponseStageTransition('wrapup')).toEqual({
      delayMs: ASSISTANT_RESPONSE_STAGE_DELAYS.beforeCardMs,
      nextStage: 'card',
    });
  });

  it('does not create transitions for terminal states', () => {
    expect(getAssistantResponseStageTransition('thinking')).toBeNull();
    expect(getAssistantResponseStageTransition('card')).toBeNull();
    expect(getAssistantResponseStageTransition('done')).toBeNull();
  });
});
