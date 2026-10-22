import { describe, expect, it } from 'vitest';

import { formatDateCalendarDate } from '../formatDateCalendarDate';
import { getDateCalendarKeyboardTarget } from '../getDateCalendarKeyboardTarget';
import { getDateCalendarWeeks } from '../getDateCalendarWeeks';
import { parseDateCalendarDate } from '../parseDateCalendarDate';
import { shiftDateCalendarDate } from '../shiftDateCalendarDate';
import { validateDateCalendarHighlightedRange } from '../validateDateCalendarHighlightedRange';

describe('calendar date parsing and formatting', () => {
  it.each(['0001-01-01', '0051-06-15', '2000-02-29', '9999-12-31'])(
    'preserves the canonical date %s, including years below 100',
    (value) => {
      expect(formatDateCalendarDate(parseDateCalendarDate(value))).toBe(value);
      expect(parseDateCalendarDate(value).getUTCHours()).toBe(0);
    },
  );

  it.each([
    '2026-2-01',
    '2026-02-01T00:00:00Z',
    '2026-02-01\n',
    '2100-02-29',
    '2026-04-31',
    '2026-00-01',
    '2026-01-00',
    '0000-01-01',
    '10000-01-01',
  ])('rejects the invalid or noncanonical date %s', (value) => {
    expect(() => parseDateCalendarDate(value)).toThrow(RangeError);
  });

  it('formats the UTC fields of a Date', () => {
    expect(formatDateCalendarDate(new Date('2026-10-22T23:30:00-04:00'))).toBe(
      '2026-10-23',
    );
  });

  it('rejects invalid Date objects instead of formatting an invalid year', () => {
    expect(() => formatDateCalendarDate(new Date(Number.NaN))).toThrow(
      RangeError,
    );
  });
});

describe('calendar date shifts', () => {
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

describe('calendar month weeks', () => {
  it('returns four complete weeks for a 28-day month beginning on the week start', () => {
    const weeks = getDateCalendarWeeks({
      viewedMonth: '2026-02',
      weekStart: 0,
    });

    expect(weeks).toHaveLength(4);
    expect(weeks[0]?.[0]).toBe('2026-02-01');
    expect(weeks[3]?.[6]).toBe('2026-02-28');
  });

  it('includes adjacent month dates when the configured week start changes', () => {
    const weeks = getDateCalendarWeeks({
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
    const weeks = getDateCalendarWeeks({
      viewedMonth: '2026-08',
      weekStart: 0,
    });

    expect(weeks).toHaveLength(6);
    expect(weeks[0]?.[0]).toBe('2026-07-26');
    expect(weeks[5]?.[6]).toBe('2026-09-05');
  });

  it('uses empty boundary cells only beyond the supported years', () => {
    const firstWeeks = getDateCalendarWeeks({
      viewedMonth: '0001-01',
      weekStart: 0,
    });
    const lastWeeks = getDateCalendarWeeks({
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

describe('calendar keyboard targets', () => {
  it.each([
    { key: 'ArrowLeft', direction: 'ltr' as const, expected: '2026-10-21' },
    { key: 'ArrowRight', direction: 'ltr' as const, expected: '2026-10-23' },
    { key: 'ArrowLeft', direction: 'rtl' as const, expected: '2026-10-23' },
    { key: 'ArrowRight', direction: 'rtl' as const, expected: '2026-10-21' },
    { key: 'ArrowUp', direction: 'ltr' as const, expected: '2026-10-15' },
    { key: 'ArrowDown', direction: 'ltr' as const, expected: '2026-10-29' },
    { key: 'Home', direction: 'ltr' as const, expected: '2026-10-19' },
    { key: 'End', direction: 'ltr' as const, expected: '2026-10-25' },
    { key: 'PageUp', direction: 'ltr' as const, expected: '2026-09-22' },
    { key: 'PageDown', direction: 'ltr' as const, expected: '2026-11-22' },
  ])('maps $key in $direction to $expected', ({ key, direction, expected }) => {
    expect(
      getDateCalendarKeyboardTarget({
        date: '2026-10-22',
        key,
        direction,
        shiftKey: false,
        weekStart: 1,
      }),
    ).toBe(expected);
  });

  it('uses the configured start of the week for Home and End', () => {
    const keyboardState = {
      date: '2026-10-22',
      direction: 'ltr' as const,
      shiftKey: false,
      weekStart: 0 as const,
    };

    expect(
      getDateCalendarKeyboardTarget({ ...keyboardState, key: 'Home' }),
    ).toBe('2026-10-18');
    expect(
      getDateCalendarKeyboardTarget({ ...keyboardState, key: 'End' }),
    ).toBe('2026-10-24');
  });

  it('clamps leap day when Shift and PageDown request the following year', () => {
    expect(
      getDateCalendarKeyboardTarget({
        date: '2024-02-29',
        key: 'PageDown',
        direction: 'ltr',
        shiftKey: true,
        weekStart: 0,
      }),
    ).toBe('2025-02-28');
  });

  it('does not cross the lower year bound or handle unrelated keys', () => {
    const keyboardState = {
      date: '0001-01-01',
      direction: 'ltr' as const,
      shiftKey: false,
      weekStart: 0 as const,
    };

    expect(
      getDateCalendarKeyboardTarget({ ...keyboardState, key: 'ArrowLeft' }),
    ).toBeNull();
    expect(
      getDateCalendarKeyboardTarget({ ...keyboardState, key: 'Tab' }),
    ).toBeNull();
  });
});

describe('calendar highlighted range validation', () => {
  it.each([
    { start: '2026-10-07', end: '2026-10-09' },
    { start: '2026-10-07', end: '2026-10-07' },
    { start: '2026-12-31', end: '2027-01-01' },
  ])('accepts the inclusive range from $start to $end', (range) => {
    expect(() => validateDateCalendarHighlightedRange(range)).not.toThrow();
  });

  it.each([
    { start: '2026-10-09', end: '2026-10-07' },
    { start: '2026-2-01', end: '2026-10-07' },
    { start: '2026-10-07', end: '2026-02-30' },
  ])('rejects the invalid range from $start to $end', (range) => {
    expect(() => validateDateCalendarHighlightedRange(range)).toThrow(
      RangeError,
    );
  });
});
