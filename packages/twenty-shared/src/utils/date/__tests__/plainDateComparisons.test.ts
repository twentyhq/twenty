import { Temporal } from 'temporal-polyfill';

import { isPlainDateAfter } from '@/utils/date/isPlainDateAfter';
import { isPlainDateBefore } from '@/utils/date/isPlainDateBefore';
import { isPlainDateBeforeOrEqual } from '@/utils/date/isPlainDateBeforeOrEqual';
import { isPlainDateInSameMonth } from '@/utils/date/isPlainDateInSameMonth';
import { isPlainDateInWeekend } from '@/utils/date/isPlainDateInWeekend';
import { isSamePlainDate } from '@/utils/date/isSamePlainDate';

describe('isPlainDateAfter', () => {
  it('should return true when first date is after second', () => {
    const a = Temporal.PlainDate.from('2024-03-15');
    const b = Temporal.PlainDate.from('2024-03-10');

    expect(isPlainDateAfter(a, b)).toBe(true);
  });

  it('should return false when first date is before second', () => {
    const a = Temporal.PlainDate.from('2024-03-10');
    const b = Temporal.PlainDate.from('2024-03-15');

    expect(isPlainDateAfter(a, b)).toBe(false);
  });

  it('should return false when dates are equal', () => {
    const a = Temporal.PlainDate.from('2024-03-15');
    const b = Temporal.PlainDate.from('2024-03-15');

    expect(isPlainDateAfter(a, b)).toBe(false);
  });
});

describe('isPlainDateBefore', () => {
  it('should return true when first date is before second', () => {
    const a = Temporal.PlainDate.from('2024-03-10');
    const b = Temporal.PlainDate.from('2024-03-15');

    expect(isPlainDateBefore(a, b)).toBe(true);
  });

  it('should return false when first date is after second', () => {
    const a = Temporal.PlainDate.from('2024-03-15');
    const b = Temporal.PlainDate.from('2024-03-10');

    expect(isPlainDateBefore(a, b)).toBe(false);
  });
});

describe('isPlainDateBeforeOrEqual', () => {
  it('should return true when first date is before second', () => {
    const a = Temporal.PlainDate.from('2024-03-10');
    const b = Temporal.PlainDate.from('2024-03-15');

    expect(isPlainDateBeforeOrEqual(a, b)).toBe(true);
  });

  it('should return true when dates are equal', () => {
    const a = Temporal.PlainDate.from('2024-03-15');
    const b = Temporal.PlainDate.from('2024-03-15');

    expect(isPlainDateBeforeOrEqual(a, b)).toBe(true);
  });

  it('should return false when first date is after second', () => {
    const a = Temporal.PlainDate.from('2024-03-20');
    const b = Temporal.PlainDate.from('2024-03-15');

    expect(isPlainDateBeforeOrEqual(a, b)).toBe(false);
  });
});

describe('isPlainDateInSameMonth', () => {
  it('should return true for dates in same month and year', () => {
    const a = Temporal.PlainDate.from('2024-03-01');
    const b = Temporal.PlainDate.from('2024-03-31');

    expect(isPlainDateInSameMonth(a, b)).toBe(true);
  });

  it('should return false for dates in different months', () => {
    const a = Temporal.PlainDate.from('2024-03-15');
    const b = Temporal.PlainDate.from('2024-04-15');

    expect(isPlainDateInSameMonth(a, b)).toBe(false);
  });

  it('should return false for same month but different year', () => {
    const a = Temporal.PlainDate.from('2024-03-15');
    const b = Temporal.PlainDate.from('2025-03-15');

    expect(isPlainDateInSameMonth(a, b)).toBe(false);
  });
});

describe('isPlainDateInWeekend', () => {
  it('should return true for Saturday', () => {
    // 2024-03-16 is a Saturday
    const saturday = Temporal.PlainDate.from('2024-03-16');

    expect(isPlainDateInWeekend(saturday)).toBe(true);
  });

  it('should return true for Sunday', () => {
    // 2024-03-17 is a Sunday
    const sunday = Temporal.PlainDate.from('2024-03-17');

    expect(isPlainDateInWeekend(sunday)).toBe(true);
  });

  it('should return false for a weekday', () => {
    // 2024-03-18 is a Monday
    const monday = Temporal.PlainDate.from('2024-03-18');

    expect(isPlainDateInWeekend(monday)).toBe(false);
  });
});

describe('isSamePlainDate', () => {
  it('should return true for equal dates', () => {
    const a = Temporal.PlainDate.from('2024-03-15');
    const b = Temporal.PlainDate.from('2024-03-15');

    expect(isSamePlainDate(a, b)).toBe(true);
  });

  it('should return false for different dates', () => {
    const a = Temporal.PlainDate.from('2024-03-15');
    const b = Temporal.PlainDate.from('2024-03-16');

    expect(isSamePlainDate(a, b)).toBe(false);
  });
});
