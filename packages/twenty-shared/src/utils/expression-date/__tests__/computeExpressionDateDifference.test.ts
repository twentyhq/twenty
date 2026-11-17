import { computeExpressionDateDifference } from '@/utils/expression-date/computeExpressionDateDifference';

describe('computeExpressionDateDifference', () => {
  it.each([
    ['2026-09-23T10:00:00.000Z', '2026-09-23T11:29:59.000Z', 'MINUTE', 89],
    ['2026-09-23T10:00:00.000Z', '2026-09-23T11:29:59.000Z', 'HOUR', 1],
    ['2026-09-23T11:29:59.000Z', '2026-09-23T10:00:00.000Z', 'HOUR', -1],
    ['2026-09-23T23:59:00.000Z', '2026-09-24T00:01:00.000Z', 'DAY', 1],
    ['2026-09-23', '2026-09-30', 'WEEK', 1],
    ['2026-09-30', '2026-09-23', 'WEEK', -1],
    ['2026-01-31', '2026-02-28', 'MONTH', 0],
    ['2026-01-31', '2026-03-01', 'MONTH', 1],
    ['2026-03-01', '2026-01-31', 'MONTH', -1],
    ['2026-01-15', '2026-07-15', 'QUARTER', 2],
    ['2025-09-24', '2026-09-23', 'YEAR', 0],
    ['2025-09-23', '2026-09-23T00:00:00.000Z', 'YEAR', 1],
  ])('dateDiff(%s, %s, %s) is %s', (from, to, unit, expected) => {
    expect(computeExpressionDateDifference(from, to, unit)).toBe(expected);
  });

  it('should read a date without time as midnight UTC for elapsed units', () => {
    expect(
      computeExpressionDateDifference(
        '2026-09-23',
        '2026-09-23T02:30:00.000Z',
        'MINUTE',
      ),
    ).toBe(150);
  });

  it('should return 0, not -0, for less than a unit backwards', () => {
    expect(
      Object.is(
        computeExpressionDateDifference(
          '2026-09-23T10:30:00.000Z',
          '2026-09-23T10:00:00.000Z',
          'HOUR',
        ),
        0,
      ),
    ).toBe(true);
  });

  it('should return null for a missing or unreadable date', () => {
    expect(
      computeExpressionDateDifference(null, '2026-09-23', 'DAY'),
    ).toBeNull();
    expect(
      computeExpressionDateDifference('2026-09-23', 'not a date', 'DAY'),
    ).toBeNull();
  });

  it('should throw for an unknown unit, even without a date', () => {
    expect(() =>
      computeExpressionDateDifference(undefined, undefined, 'DAYS'),
    ).toThrow(
      `"DAYS" is not a date unit: use 'MINUTE', 'HOUR', 'DAY', 'WEEK', 'MONTH', 'QUARTER' or 'YEAR'`,
    );
  });
});
