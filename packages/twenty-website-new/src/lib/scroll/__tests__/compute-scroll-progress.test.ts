import { computeScrollProgress } from '@/lib/scroll/compute-scroll-progress';

describe('computeScrollProgress', () => {
  const VIEWPORT = 800;

  it('returns null when the container is shorter than the viewport', () => {
    expect(computeScrollProgress(0, 600, VIEWPORT)).toBeNull();
    expect(computeScrollProgress(0, VIEWPORT, VIEWPORT)).toBeNull();
  });

  it('returns 0 when the container has not yet entered the viewport', () => {
    // Container is below the viewport: rectTop is positive.
    expect(computeScrollProgress(500, 2400, VIEWPORT)).toBe(0);
    expect(computeScrollProgress(0, 2400, VIEWPORT)).toBe(0);
  });

  it('returns 1 when the container has scrolled past the viewport', () => {
    // Container starts well above the viewport: rectTop is very negative.
    expect(computeScrollProgress(-3200, 2400, VIEWPORT)).toBe(1);
    // Boundary: -rectTop equals the scrollable distance exactly.
    expect(computeScrollProgress(-1600, 2400, VIEWPORT)).toBe(1);
  });

  it('linearly interpolates between 0 and 1 in the middle of the scroll range', () => {
    // Scrollable distance = 2400 - 800 = 1600.
    // -rectTop = 800 → progress = 0.5.
    expect(computeScrollProgress(-800, 2400, VIEWPORT)).toBeCloseTo(0.5);
    // -rectTop = 400 → progress = 0.25.
    expect(computeScrollProgress(-400, 2400, VIEWPORT)).toBeCloseTo(0.25);
    // -rectTop = 1200 → progress = 0.75.
    expect(computeScrollProgress(-1200, 2400, VIEWPORT)).toBeCloseTo(0.75);
  });

  it('clamps at the boundaries instead of returning slightly out-of-range values', () => {
    // Scrollable distance = 1000. -rectTop = 1000.0001 → would be > 1.
    const justPast = computeScrollProgress(-1000.0001, 1800, VIEWPORT);
    expect(justPast).toBe(1);
    // -rectTop = -0.0001 → would be slightly < 0.
    const justBefore = computeScrollProgress(0.0001, 1800, VIEWPORT);
    expect(justBefore).toBe(0);
  });

  it('treats the container exactly equal to the viewport as null (no scroll range)', () => {
    expect(computeScrollProgress(0, 800, 800)).toBeNull();
    expect(computeScrollProgress(-100, 800, 800)).toBeNull();
  });

  it('handles odd-but-valid input gracefully', () => {
    // Zero viewport (jsdom edge case): scrollableDistance = rectHeight.
    expect(computeScrollProgress(-50, 100, 0)).toBe(0.5);
    // Zero rect height: returns null.
    expect(computeScrollProgress(0, 0, VIEWPORT)).toBeNull();
  });
});
