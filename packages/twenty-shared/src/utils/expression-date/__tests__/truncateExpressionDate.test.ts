import { truncateExpressionDate } from '@/utils/expression-date/truncateExpressionDate';

describe('truncateExpressionDate', () => {
  it.each([
    ['2026-09-23T10:41:59.123Z', 'MINUTE', '2026-09-23T10:41:00.000Z'],
    ['2026-09-23T10:41:59.123Z', 'HOUR', '2026-09-23T10:00:00.000Z'],
    ['2026-09-23T10:41:59.123Z', 'DAY', '2026-09-23T00:00:00.000Z'],
    ['2026-09-23T10:41:59.123Z', 'WEEK', '2026-09-21T00:00:00.000Z'],
    ['2026-09-23', 'WEEK', '2026-09-21'],
    ['2026-09-27', 'WEEK', '2026-09-21'],
    ['2026-09-23', 'MONTH', '2026-09-01'],
    ['2026-09-23', 'QUARTER', '2026-07-01'],
    ['2026-09-23T10:41:59.123Z', 'YEAR', '2026-01-01T00:00:00.000Z'],
    ['2026-09-23', 'HOUR', '2026-09-23'],
  ])('dateTrunc(%s, %s) is %s', (value, unit, expected) => {
    expect(truncateExpressionDate(value, unit)).toBe(expected);
  });

  it('should return null for a missing date', () => {
    expect(truncateExpressionDate(undefined, 'DAY')).toBeNull();
  });
});
