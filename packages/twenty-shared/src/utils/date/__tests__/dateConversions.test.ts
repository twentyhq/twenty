import { Temporal } from 'temporal-polyfill';

import { parseToPlainDateOrThrow } from '@/utils/date/parseToPlainDateOrThrow';
import { turnJSDateToPlainDate } from '@/utils/date/turnJSDateToPlainDate';
import { turnPlainDateIntoUserTimeZoneInstantString } from '@/utils/date/turnPlainDateIntoUserTimeZoneInstantString';
import { turnPlainDateToShiftedDateInSystemTimeZone } from '@/utils/date/turnPlainDateToShiftedDateInSystemTimeZone';

describe('parseToPlainDateOrThrow', () => {
  it('should parse an ISO instant string', () => {
    const result = parseToPlainDateOrThrow('2024-03-15T10:00:00Z');

    expect(result.year).toBe(2024);
    expect(result.month).toBe(3);
    expect(result.day).toBe(15);
  });

  it('should parse a plain date string', () => {
    const result = parseToPlainDateOrThrow('2024-03-15');

    expect(result.year).toBe(2024);
    expect(result.month).toBe(3);
    expect(result.day).toBe(15);
  });

  it('should throw for an invalid date string', () => {
    expect(() => parseToPlainDateOrThrow('not-a-date')).toThrow(
      'Cannot parse date string as PlainDate',
    );
  });
});

describe('turnJSDateToPlainDate', () => {
  it('should convert a JS Date to a PlainDate', () => {
    const jsDate = new Date(2024, 2, 15); // March 15, 2024

    const result = turnJSDateToPlainDate(jsDate);

    expect(result.year).toBe(2024);
    expect(result.month).toBe(3);
    expect(result.day).toBe(15);
  });
});

describe('turnPlainDateIntoUserTimeZoneInstantString', () => {
  it('should convert a PlainDate to an instant string in the given timezone', () => {
    const plainDate = Temporal.PlainDate.from('2024-03-15');
    const result = turnPlainDateIntoUserTimeZoneInstantString(plainDate, 'UTC');

    expect(result).toBe('2024-03-15T00:00:00Z');
  });
});

describe('turnPlainDateToShiftedDateInSystemTimeZone', () => {
  it('should return a JS Date for the given PlainDate', () => {
    const plainDate = Temporal.PlainDate.from('2024-03-15');

    const result = turnPlainDateToShiftedDateInSystemTimeZone(plainDate);

    expect(result).toBeInstanceOf(Date);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(2); // 0-indexed
    expect(result.getDate()).toBe(15);
  });
});
