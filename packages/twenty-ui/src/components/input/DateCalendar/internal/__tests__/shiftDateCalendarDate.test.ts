import { describe, expect, it } from 'vitest';

import { shiftDateCalendarDate } from '../shiftDateCalendarDate';

describe('shiftDateCalendarDate', () => {
  it.each([
    { date: '2026-01-31', months: 1, expected: '2026-02-28' },
    { date: '2024-01-31', months: 1, expected: '2024-02-29' },
    { date: '2026-03-31', months: -1, expected: '2026-02-28' },
    { date: '2024-02-29', years: 1, expected: '2025-02-28' },
    { date: '2024-02-29', years: 4, expected: '2028-02-29' },
    { date: '0051-12-31', days: 1, expected: '0052-01-01' },
    { date: '2026-03-07', days: 2, expected: '2026-03-09' },
    { date: '2024-02-29', years: 1, days: 1, expected: '2025-03-01' },
  ])(
    'shifts $date with day clamping to $expected',
    ({ expected, ...change }) => {
      expect(shiftDateCalendarDate(change)).toBe(expected);
    },
  );

  it.each([
    { date: '0001-01-01', days: -1 },
    { date: '0001-01-31', months: -1 },
    { date: '9999-12-31', days: 1 },
    { date: '9999-12-31', years: 1 },
    { date: '2026-10-22', days: 0.5 },
  ])('does not return an unsupported date for $date', (change) => {
    expect(shiftDateCalendarDate(change)).toBeNull();
  });
});
