import { computeMidpointPosition } from '@/utils/position/computeMidpointPosition';

describe('computeMidpointPosition', () => {
  it('should return the midpoint of two integers', () => {
    expect(
      computeMidpointPosition({ firstPosition: 0, secondPosition: 10 }),
    ).toBe(5);
    expect(
      computeMidpointPosition({ firstPosition: 1, secondPosition: 2 }),
    ).toBe(1.5);
  });

  it('should not depend on argument order', () => {
    expect(
      computeMidpointPosition({ firstPosition: 3, secondPosition: 1.1 }),
    ).toBe(2.05);
    expect(
      computeMidpointPosition({ firstPosition: 1.1, secondPosition: 3 }),
    ).toBe(2.05);
  });

  it('should handle negative and zero-crossing positions', () => {
    expect(
      computeMidpointPosition({ firstPosition: -3, secondPosition: -1 }),
    ).toBe(-2);
    expect(
      computeMidpointPosition({ firstPosition: -1, secondPosition: 2 }),
    ).toBe(0.5);
    expect(
      computeMidpointPosition({ firstPosition: -0.1, secondPosition: 0.1 }),
    ).toBe(0);
  });

  it('should return a clean decimal where float arithmetic would not', () => {
    expect((0.1 + 0.2) / 2).toBe(0.15000000000000002);
    expect(
      computeMidpointPosition({ firstPosition: 0.1, secondPosition: 0.2 }),
    ).toBe(0.15);
    expect(
      computeMidpointPosition({ firstPosition: 0.7, secondPosition: 0.8 }),
    ).toBe(0.75);
  });

  it('should return the same position for equal inputs', () => {
    expect(
      computeMidpointPosition({
        firstPosition: 0.30000000000000004,
        secondPosition: 0.30000000000000004,
      }),
    ).toBe(0.30000000000000004);
  });

  it('should not overflow near the largest double', () => {
    expect((Number.MAX_VALUE + Number.MAX_VALUE) / 2).toBe(Infinity);
    expect(
      computeMidpointPosition({
        firstPosition: Number.MAX_VALUE,
        secondPosition: Number.MAX_VALUE,
      }),
    ).toBe(Number.MAX_VALUE);
    expect(
      computeMidpointPosition({
        firstPosition: -Number.MAX_VALUE,
        secondPosition: Number.MAX_VALUE,
      }),
    ).toBe(0);
  });

  it('should handle very small magnitudes', () => {
    expect(
      computeMidpointPosition({
        firstPosition: 1e-300,
        secondPosition: 3e-300,
      }),
    ).toBe(2e-300);

    const result = computeMidpointPosition({
      firstPosition: 0,
      secondPosition: Number.MIN_VALUE,
    });

    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(Number.MIN_VALUE);
  });

  it('should stay within bounds when neighbors are adjacent doubles', () => {
    const upperPosition = 1 + Number.EPSILON;
    const result = computeMidpointPosition({
      firstPosition: 1,
      secondPosition: upperPosition,
    });

    expect([1, upperPosition]).toContain(result);
  });

  it('should keep repeated halving ordered until precision is exhausted', () => {
    let lowerPosition = 1;
    let upperPosition = 2;
    let numberOfHalvings = 0;

    while (numberOfHalvings < 100) {
      const midpoint = computeMidpointPosition({
        firstPosition: lowerPosition,
        secondPosition: upperPosition,
      });

      expect(midpoint).toBeGreaterThanOrEqual(lowerPosition);
      expect(midpoint).toBeLessThanOrEqual(upperPosition);

      if (midpoint === lowerPosition || midpoint === upperPosition) {
        break;
      }

      upperPosition = midpoint;
      numberOfHalvings++;
    }

    expect(numberOfHalvings).toBe(52);
  });

  it('should always stay within bounds for arbitrary positions', () => {
    let seed = 42;
    const nextRandom = () => {
      seed = (seed * 16807) % 2147483647;

      return seed / 2147483647;
    };

    for (let iteration = 0; iteration < 1000; iteration++) {
      const firstPosition = (nextRandom() - 0.5) * 10 ** (nextRandom() * 20);
      const secondPosition = (nextRandom() - 0.5) * 10 ** (nextRandom() * 20);
      const midpoint = computeMidpointPosition({
        firstPosition,
        secondPosition,
      });

      expect(midpoint).toBeGreaterThanOrEqual(
        Math.min(firstPosition, secondPosition),
      );
      expect(midpoint).toBeLessThanOrEqual(
        Math.max(firstPosition, secondPosition),
      );
    }
  });
});
