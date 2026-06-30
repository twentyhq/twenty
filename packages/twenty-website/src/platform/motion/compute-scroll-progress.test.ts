import { computeScrollProgress } from './compute-scroll-progress';

describe('computeScrollProgress', () => {
  it('should return null when the container cannot scroll', () => {
    expect(computeScrollProgress(0, 800, 900)).toBeNull();
    expect(computeScrollProgress(0, 900, 900)).toBeNull();
  });

  it('should report 0 before the container top passes the viewport top', () => {
    expect(computeScrollProgress(120, 2700, 900)).toBe(0);
    expect(computeScrollProgress(0, 2700, 900)).toBe(0);
  });

  it('should report progress through the scrollable distance', () => {
    expect(computeScrollProgress(-900, 2700, 900)).toBeCloseTo(0.5);
    expect(computeScrollProgress(-450, 2700, 900)).toBeCloseTo(0.25);
  });

  it('should clamp at 1 when the container bottom reaches the viewport bottom', () => {
    expect(computeScrollProgress(-1800, 2700, 900)).toBe(1);
    expect(computeScrollProgress(-2400, 2700, 900)).toBe(1);
  });
});
