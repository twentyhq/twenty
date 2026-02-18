import { Temporal } from 'temporal-polyfill';

import { resolveRelativeDateTimeFilter } from '@/utils/filter/dates/utils/resolveRelativeDateTimeFilter';

describe('resolveRelativeDateTimeFilter', () => {
  const referenceZdt = Temporal.ZonedDateTime.from('2024-03-15T12:00:00[UTC]');

  describe('NEXT direction', () => {
    it('should compute for sub-day unit (HOUR)', () => {
      const result = resolveRelativeDateTimeFilter(
        { direction: 'NEXT', amount: 3, unit: 'HOUR' },
        referenceZdt,
      );

      expect(result.start).toEqual(referenceZdt);
      expect(result.end?.hour).toBe(15);
    });

    it('should compute for DAY unit', () => {
      const result = resolveRelativeDateTimeFilter(
        { direction: 'NEXT', amount: 7, unit: 'DAY' },
        referenceZdt,
      );

      expect(result.start?.day).toBe(16);
      expect(result.end?.day).toBe(23);
    });

    it('should throw if amount is undefined', () => {
      expect(() =>
        resolveRelativeDateTimeFilter(
          { direction: 'NEXT', amount: undefined as any, unit: 'DAY' },
          referenceZdt,
        ),
      ).toThrow('Amount is required');
    });
  });

  describe('PAST direction', () => {
    it('should compute for sub-day unit (MINUTE)', () => {
      const result = resolveRelativeDateTimeFilter(
        { direction: 'PAST', amount: 30, unit: 'MINUTE' },
        referenceZdt,
      );

      expect(result.end).toEqual(referenceZdt);
      expect(result.start?.minute).toBe(30);
      expect(result.start?.hour).toBe(11);
    });

    it('should compute for DAY unit', () => {
      const result = resolveRelativeDateTimeFilter(
        { direction: 'PAST', amount: 3, unit: 'DAY' },
        referenceZdt,
      );

      expect(result.end?.hour).toBe(0);
      expect(result.start?.day).toBe(12);
    });

    it('should throw if amount is undefined', () => {
      expect(() =>
        resolveRelativeDateTimeFilter(
          { direction: 'PAST', amount: undefined as any, unit: 'MONTH' },
          referenceZdt,
        ),
      ).toThrow('Amount is required');
    });
  });

  describe('THIS direction', () => {
    it('should compute for THIS MONTH', () => {
      const result = resolveRelativeDateTimeFilter(
        { direction: 'THIS', amount: 1, unit: 'MONTH' },
        referenceZdt,
      );

      expect(result.start?.day).toBe(1);
      expect(result.end?.month).toBe(4);
    });
  });
});
