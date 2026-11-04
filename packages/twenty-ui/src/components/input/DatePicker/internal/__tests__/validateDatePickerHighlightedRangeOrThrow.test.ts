import { describe, expect, it } from 'vitest';

import { DatePickerException } from '../DatePickerException';

import { validateDatePickerHighlightedRangeOrThrow } from '../validateDatePickerHighlightedRangeOrThrow';

describe('validateDatePickerHighlightedRangeOrThrow', () => {
  it.each([
    { start: '2026-10-07', end: '2026-10-09' },
    { start: '2026-10-07', end: '2026-10-07' },
    { start: '2026-12-31', end: '2027-01-01' },
  ])('accepts the inclusive range from $start to $end', (range) => {
    expect(() =>
      validateDatePickerHighlightedRangeOrThrow(range),
    ).not.toThrow();
  });

  it.each([
    { start: '2026-10-09', end: '2026-10-07' },
    { start: '2026-2-01', end: '2026-10-07' },
    { start: '2026-10-07', end: '2026-02-30' },
  ])('rejects the invalid range from $start to $end', (range) => {
    expect(() => validateDatePickerHighlightedRangeOrThrow(range)).toThrow(
      DatePickerException,
    );
  });
});
