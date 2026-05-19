import {
  easeOutCubic,
  getAnimatedNumberValue,
} from '@/lib/animation/animated-number';

describe('animated number', () => {
  it('returns the starting value before time has elapsed', () => {
    expect(
      getAnimatedNumberValue({
        elapsedMs: 0,
        from: 10,
        target: 110,
      }),
    ).toBe(10);
  });

  it('applies cubic easing to the interpolated value', () => {
    expect(
      getAnimatedNumberValue({
        durationMs: 500,
        elapsedMs: 250,
        from: 0,
        target: 100,
      }),
    ).toBe(88);
  });

  it('returns the target value after the duration has elapsed', () => {
    expect(
      getAnimatedNumberValue({
        durationMs: 500,
        elapsedMs: 750,
        from: 0,
        target: 100,
      }),
    ).toBe(100);
  });

  it('returns the target value when duration is not positive', () => {
    expect(
      getAnimatedNumberValue({
        durationMs: 0,
        elapsedMs: 0,
        from: 0,
        target: 100,
      }),
    ).toBe(100);
  });

  it('supports custom easing and rounding', () => {
    expect(
      getAnimatedNumberValue({
        durationMs: 100,
        easing: (progress) => progress,
        elapsedMs: 50,
        from: 0,
        round: Math.floor,
        target: 11,
      }),
    ).toBe(5);
  });

  it('clamps easing input to a unit interval', () => {
    expect(easeOutCubic(Number.NaN)).toBe(0);
    expect(easeOutCubic(-1)).toBe(0);
    expect(easeOutCubic(2)).toBe(1);
  });
});
