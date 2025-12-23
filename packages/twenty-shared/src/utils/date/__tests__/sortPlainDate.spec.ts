import { Temporal } from 'temporal-polyfill';

import { sortPlainDate } from '../sortPlainDate';

describe('sortPlainDate', () => {
  const earlyDate = Temporal.PlainDate.from('2024-01-15');
  const middleDate = Temporal.PlainDate.from('2024-06-20');
  const lateDate = Temporal.PlainDate.from('2024-12-25');

  describe('ascending order', () => {
    const comparator = sortPlainDate('asc');

    it('should return negative when first date is earlier', () => {
      expect(comparator(earlyDate, lateDate)).toBeLessThan(0);
    });

    it('should return positive when first date is later', () => {
      expect(comparator(lateDate, earlyDate)).toBeGreaterThan(0);
    });

    it('should return zero when dates are equal', () => {
      const sameDate = Temporal.PlainDate.from('2024-06-20');

      expect(comparator(middleDate, sameDate)).toBe(0);
    });
  });

  describe('descending order', () => {
    const comparator = sortPlainDate('desc');

    it('should return positive when first date is earlier', () => {
      expect(comparator(earlyDate, lateDate)).toBeGreaterThan(0);
    });

    it('should return negative when first date is later', () => {
      expect(comparator(lateDate, earlyDate)).toBeLessThan(0);
    });

    it('should return zero when dates are equal', () => {
      const sameDate = Temporal.PlainDate.from('2024-06-20');

      expect(comparator(middleDate, sameDate)).toStrictEqual(0);
    });
  });

  describe('array sorting', () => {
    it('should sort dates in ascending order', () => {
      const dates = [middleDate, lateDate, earlyDate];
      const sorted = [...dates].sort(sortPlainDate('asc'));

      expect(sorted).toEqual([earlyDate, middleDate, lateDate]);
    });

    it('should sort dates in descending order', () => {
      const dates = [middleDate, lateDate, earlyDate];
      const sorted = [...dates].sort(sortPlainDate('desc'));

      expect(sorted).toEqual([lateDate, middleDate, earlyDate]);
    });
  });
});
