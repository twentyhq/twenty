import { describe, expect, it } from 'vitest';

import { DatePickerException } from '../DatePickerException';

import { parseDatePickerDateOrThrow } from '../parseDatePickerDateOrThrow';

describe('parseDatePickerDateOrThrow', () => {
  it.each(['0001-01-01', '0051-06-15', '2000-02-29', '9999-12-31'])(
    'parses %s as UTC midnight, including years below 100',
    (value) => {
      expect(parseDatePickerDateOrThrow(value).toISOString()).toBe(
        `${value}T00:00:00.000Z`,
      );
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
    expect(() => parseDatePickerDateOrThrow(value)).toThrow(
      DatePickerException,
    );
  });
});
