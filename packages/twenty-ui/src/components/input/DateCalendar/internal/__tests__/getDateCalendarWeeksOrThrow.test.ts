import { describe, expect, it } from 'vitest';

import { getDateCalendarWeeksOrThrow } from '../getDateCalendarWeeksOrThrow';

describe('getDateCalendarWeeksOrThrow', () => {
  it('returns four complete weeks for a 28-day month beginning on the week start', () => {
    const weeks = getDateCalendarWeeksOrThrow({
      viewedMonth: '2026-02',
      weekStart: 0,
    });

    expect(weeks).toHaveLength(4);
    expect(weeks[0]?.[0]).toBe('2026-02-01');
    expect(weeks[3]?.[6]).toBe('2026-02-28');
  });

  it('includes adjacent month dates when the configured week start changes', () => {
    const weeks = getDateCalendarWeeksOrThrow({
      viewedMonth: '2026-02',
      weekStart: 1,
    });

    expect(weeks).toHaveLength(5);
    expect(weeks[0]).toEqual([
      '2026-01-26',
      '2026-01-27',
      '2026-01-28',
      '2026-01-29',
      '2026-01-30',
      '2026-01-31',
      '2026-02-01',
    ]);
    expect(weeks[4]?.[6]).toBe('2026-03-01');
  });

  it('includes six complete weeks when the month needs them', () => {
    const weeks = getDateCalendarWeeksOrThrow({
      viewedMonth: '2026-08',
      weekStart: 0,
    });

    expect(weeks).toHaveLength(6);
    expect(weeks[0]?.[0]).toBe('2026-07-26');
    expect(weeks[5]?.[6]).toBe('2026-09-05');
  });

  it('uses empty boundary cells only beyond the supported years', () => {
    const firstWeeks = getDateCalendarWeeksOrThrow({
      viewedMonth: '0001-01',
      weekStart: 0,
    });
    const lastWeeks = getDateCalendarWeeksOrThrow({
      viewedMonth: '9999-12',
      weekStart: 0,
    });

    expect(firstWeeks[0]).toEqual([
      null,
      '0001-01-01',
      '0001-01-02',
      '0001-01-03',
      '0001-01-04',
      '0001-01-05',
      '0001-01-06',
    ]);
    expect(lastWeeks[lastWeeks.length - 1]).toEqual([
      '9999-12-26',
      '9999-12-27',
      '9999-12-28',
      '9999-12-29',
      '9999-12-30',
      '9999-12-31',
      null,
    ]);
  });
});
