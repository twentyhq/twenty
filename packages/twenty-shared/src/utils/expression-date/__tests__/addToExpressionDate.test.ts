import { addToExpressionDate } from '@/utils/expression-date/addToExpressionDate';

describe('addToExpressionDate', () => {
  it.each([
    ['2026-09-23', 3, 'DAY', '2026-09-26'],
    ['2026-09-23', -1, 'WEEK', '2026-09-16'],
    ['2026-01-31', 1, 'MONTH', '2026-02-28'],
    ['2026-01-31', 1, 'QUARTER', '2026-04-30'],
    ['2024-02-29', 1, 'YEAR', '2025-02-28'],
    ['2026-09-23', 90, 'MINUTE', '2026-09-23T01:30:00.000Z'],
    ['2026-09-23T22:00:00.000Z', 4, 'HOUR', '2026-09-24T02:00:00.000Z'],
    ['2026-09-23T22:00:00Z', 1, 'DAY', '2026-09-24T22:00:00.000Z'],
    ['2026-09-23T22:00:00.000Z', 2.9, 'DAY', '2026-09-25T22:00:00.000Z'],
    ['2026-09-23T22:00:00.000Z', -2.9, 'DAY', '2026-09-21T22:00:00.000Z'],
  ])('dateAdd(%s, %s, %s) is %s', (value, amount, unit, expected) => {
    expect(addToExpressionDate(value, amount, unit)).toBe(expected);
  });

  it('should return null for a missing date or amount', () => {
    expect(addToExpressionDate(null, 1, 'DAY')).toBeNull();
    expect(addToExpressionDate('2026-09-23', null, 'DAY')).toBeNull();
  });

  it.each([
    ['2026-01-01', 1e12, 'DAY'],
    ['2026-01-01T00:00:00.000Z', 1e12, 'DAY'],
    ['2026-01-01', 300000, 'YEAR'],
    ['2026-01-01T00:00:00.000Z', -1e20, 'MINUTE'],
    ['9999-12-31', 1, 'DAY'],
    ['0001-01-01T00:00:00.000Z', -1, 'MINUTE'],
  ])(
    'should return null when dateAdd(%s, %s, %s) leaves years 1 to 9999',
    (value, amount, unit) => {
      expect(addToExpressionDate(value, amount, unit)).toBeNull();
    },
  );

  it('should throw for an unknown unit', () => {
    expect(() => addToExpressionDate('2026-09-23', 1, 'day')).toThrow(
      '"day" is not a date unit',
    );
  });
});
