import { getExpressionDatePart } from '@/utils/expression-date/getExpressionDatePart';

describe('getExpressionDatePart', () => {
  it.each([
    ['2026-09-23T10:41:00.000Z', 'YEAR', 2026],
    ['2026-09-23T10:41:00.000Z', 'QUARTER', 3],
    ['2026-09-23T10:41:00.000Z', 'MONTH', 9],
    ['2026-09-23T10:41:00.000Z', 'DAY', 23],
    ['2026-09-23T10:41:00.000Z', 'DAY_OF_WEEK', 3],
    ['2026-09-27', 'DAY_OF_WEEK', 7],
    ['2026-09-23T10:41:00.000Z', 'HOUR', 10],
    ['2026-09-23T10:41:00.000Z', 'MINUTE', 41],
    ['2026-09-23', 'HOUR', 0],
    ['2027-01-01', 'WEEK', 53],
    ['2026-09-23T10:41:00+02:00', 'HOUR', 8],
  ])('datePart(%s, %s) is %s', (value, part, expected) => {
    expect(getExpressionDatePart(value, part)).toBe(expected);
  });

  it('should throw for an unknown part', () => {
    expect(() => getExpressionDatePart('2026-09-23', 'WEEKDAY')).toThrow(
      '"WEEKDAY" is not a date part',
    );
  });
});
