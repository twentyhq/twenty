import { computeEvenlySpacedPositions } from '@/utils/position/computeEvenlySpacedPositions';

describe('computeEvenlySpacedPositions', () => {
  it('should compute evenly spaced positions between two values', () => {
    expect(
      computeEvenlySpacedPositions({
        startingPosition: 0,
        endingPosition: 10,
        numberOfPositions: 4,
      }),
    ).toEqual([2, 4, 6, 8]);
  });

  it('should return a single midpoint when computing one position', () => {
    expect(
      computeEvenlySpacedPositions({
        startingPosition: 0,
        endingPosition: 10,
        numberOfPositions: 1,
      }),
    ).toEqual([5]);
  });

  it('should return clean decimals where float arithmetic would not', () => {
    expect(
      computeEvenlySpacedPositions({
        startingPosition: 0,
        endingPosition: 1,
        numberOfPositions: 9,
      }),
    ).toEqual([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]);

    expect(
      computeEvenlySpacedPositions({
        startingPosition: 1,
        endingPosition: 2,
        numberOfPositions: 4,
      }),
    ).toEqual([1.2, 1.4, 1.6, 1.8]);

    expect(
      computeEvenlySpacedPositions({
        startingPosition: 0.1,
        endingPosition: 0.2,
        numberOfPositions: 1,
      }),
    ).toEqual([0.15]);
  });

  it('should round non-terminating steps to the nearest double', () => {
    expect(
      computeEvenlySpacedPositions({
        startingPosition: 0,
        endingPosition: 1,
        numberOfPositions: 2,
      }),
    ).toEqual([1 / 3, 2 / 3]);
  });

  it('should handle negative ranges', () => {
    expect(
      computeEvenlySpacedPositions({
        startingPosition: -1,
        endingPosition: 0,
        numberOfPositions: 4,
      }),
    ).toEqual([-0.8, -0.6, -0.4, -0.2]);
  });

  it('should return strictly increasing positions within bounds from noisy bounds', () => {
    const startingPosition = 0.1;
    const endingPosition = 0.30000000000000004;

    const result = computeEvenlySpacedPositions({
      startingPosition,
      endingPosition,
      numberOfPositions: 5,
    });

    expect(result).toHaveLength(5);
    result.forEach((position, index) => {
      expect(position).toBeGreaterThan(result[index - 1] ?? startingPosition);
    });
    expect(result.at(-1)).toBeLessThan(endingPosition);
  });

  it('should return an empty array when no positions are requested', () => {
    expect(
      computeEvenlySpacedPositions({
        startingPosition: 0,
        endingPosition: 1,
        numberOfPositions: 0,
      }),
    ).toEqual([]);
  });

  it('should return all same values when gap is zero', () => {
    expect(
      computeEvenlySpacedPositions({
        startingPosition: 5,
        endingPosition: 5,
        numberOfPositions: 3,
      }),
    ).toEqual([5, 5, 5]);
  });

  it('should throw when starting position is after ending position', () => {
    expect(() =>
      computeEvenlySpacedPositions({
        startingPosition: 10,
        endingPosition: 5,
        numberOfPositions: 1,
      }),
    ).toThrow();
  });
});
