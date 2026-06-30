import { assistantResponseStage } from './assistant-response-stage';

describe('assistantResponseStage', () => {
  it('should order every stage exactly once', () => {
    expect(new Set(assistantResponseStage.order).size).toBe(
      assistantResponseStage.order.length,
    );
    expect(assistantResponseStage.order[0]).toBe('thinking');
    expect(assistantResponseStage.order.at(-1)).toBe('done');
  });

  it('should walk the streaming chain from rocket to the card', () => {
    let stage = 'rocket' as const;
    const visited: string[] = [stage];
    let transition = assistantResponseStage.getTransition(stage);
    while (transition !== null && visited.length < 20) {
      visited.push(transition.nextStage);
      transition = assistantResponseStage.getTransition(
        transition.nextStage as typeof stage,
      );
    }
    expect(visited).toEqual([
      'rocket',
      'launch',
      'payload',
      'customer',
      'launchSite',
      'actions',
      'wrapup',
      'card',
    ]);
  });

  it('should report no transition for terminal stages', () => {
    expect(assistantResponseStage.getTransition('thinking')).toBeNull();
    expect(assistantResponseStage.getTransition('card')).toBeNull();
    expect(assistantResponseStage.getTransition('done')).toBeNull();
  });

  it('should compare stage progress by authored order', () => {
    expect(
      assistantResponseStage.hasReached({
        currentStage: 'payload',
        targetStage: 'rocket',
      }),
    ).toBe(true);
    expect(
      assistantResponseStage.hasReached({
        currentStage: 'rocket',
        targetStage: 'payload',
      }),
    ).toBe(false);
  });
});
