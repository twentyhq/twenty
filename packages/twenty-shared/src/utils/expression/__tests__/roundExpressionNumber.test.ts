import { roundExpressionNumber } from '@/utils/expression/roundExpressionNumber';

describe('roundExpressionNumber', () => {
  it.each([
    [2.55, 1, 2.6],
    [1.005, 2, 1.01],
    [-2.55, 1, -2.6],
    [-0.5, 0, -1],
    [12.345, 0, 12],
    [1e-7, 2, 0],
    [1.5e21, 2, 1.5e21],
  ])('rounds %d to %d decimals as %d', (value, decimals, expected) => {
    expect(roundExpressionNumber({ value, decimals })).toBeCloseTo(expected);
  });
});
