import { describe, expect, it } from 'vitest';

import { formatDateCalendarDate } from '../formatDateCalendarDate';

describe('formatDateCalendarDate', () => {
  it('preserves leading zeros in four-digit years', () => {
    expect(formatDateCalendarDate(new Date('0051-06-15T00:00:00Z'))).toBe(
      '0051-06-15',
    );
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
