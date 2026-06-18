import { cardReveal } from './card-reveal-frame';

const VIEWPORT_HEIGHT = 900;

describe('cardReveal', () => {
  it('should hold zero progress while the grid sits below the viewport', () => {
    expect(cardReveal.progressForGridTop(900, VIEWPORT_HEIGHT)).toBe(0);
    expect(cardReveal.progressForGridTop(1400, VIEWPORT_HEIGHT)).toBe(0);
  });

  it('should reach full progress when the grid top hits 20% of the viewport', () => {
    expect(cardReveal.progressForGridTop(180, VIEWPORT_HEIGHT)).toBe(1);
    expect(cardReveal.progressForGridTop(0, VIEWPORT_HEIGHT)).toBe(1);
  });

  it('should run progress linearly across the travel band', () => {
    expect(cardReveal.progressForGridTop(540, VIEWPORT_HEIGHT)).toBeCloseTo(
      0.5,
      10,
    );
  });

  it('should start every card hidden at the initial pose', () => {
    for (const cardIndex of [0, 1, 2]) {
      const frame = cardReveal.frameAt(0, cardIndex);
      expect(frame.opacity).toBe(0);
      expect(frame.scale).toBeCloseTo(0.88, 10);
      expect(frame.translateYPx).toBeCloseTo(200, 10);
    }
  });

  it('should settle every card at rest at full progress', () => {
    for (const cardIndex of [0, 1, 2]) {
      const frame = cardReveal.frameAt(1, cardIndex);
      expect(frame.opacity).toBe(1);
      expect(frame.scale).toBeCloseTo(1, 10);
      expect(frame.translateYPx).toBeCloseTo(0, 10);
    }
  });

  it('should stagger later cards a quarter-progress behind', () => {
    // At progress 0.25 the second card is exactly at its own zero.
    const second = cardReveal.frameAt(0.25, 1);
    expect(second.opacity).toBe(0);
    expect(second.translateYPx).toBeCloseTo(200, 10);

    const first = cardReveal.frameAt(0.25, 0);
    expect(first.opacity).toBeGreaterThan(0);
    expect(first.translateYPx).toBeLessThan(200);
  });

  it('should fade in over the first 40% of a card travel', () => {
    expect(cardReveal.frameAt(0.2, 0).opacity).toBeCloseTo(0.5, 10);
    expect(cardReveal.frameAt(0.4, 0).opacity).toBe(1);
  });

  it('should ease travel out by the quintic curve', () => {
    const frame = cardReveal.frameAt(0.5, 0);
    const eased = 1 - (1 - 0.5) ** 5;
    expect(frame.translateYPx).toBeCloseTo((1 - eased) * 200, 10);
    expect(frame.scale).toBeCloseTo(0.88 + eased * 0.12, 10);
  });
});
