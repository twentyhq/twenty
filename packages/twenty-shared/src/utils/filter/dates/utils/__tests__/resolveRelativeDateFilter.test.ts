import { Temporal } from 'temporal-polyfill';

import { resolveRelativeDateFilter } from '@/utils/filter/dates/utils/resolveRelativeDateFilter';

describe('resolveRelativeDateFilter', () => {
  const referenceZdt = Temporal.ZonedDateTime.from('2024-03-15T12:00:00[UTC]');

  describe('NEXT direction', () => {
    it('should compute start and end for NEXT 7 DAY', () => {
      const result = resolveRelativeDateFilter(
        { direction: 'NEXT', amount: 7, unit: 'DAY' },
        referenceZdt,
      );

      expect(result.start).toBe('2024-03-16');
      expect(result.end).toBe('2024-03-23');
    });

    it('should throw if amount is undefined', () => {
      expect(() =>
        resolveRelativeDateFilter(
          { direction: 'NEXT', amount: undefined as any, unit: 'DAY' },
          referenceZdt,
        ),
      ).toThrow('Amount is required');
    });
  });

  describe('PAST direction', () => {
    it('should compute start and end for PAST 7 DAY', () => {
      const result = resolveRelativeDateFilter(
        { direction: 'PAST', amount: 7, unit: 'DAY' },
        referenceZdt,
      );

      expect(result.start).toBe('2024-03-08');
      expect(result.end).toBe('2024-03-15');
    });

    it('should throw if amount is undefined', () => {
      expect(() =>
        resolveRelativeDateFilter(
          { direction: 'PAST', amount: undefined as any, unit: 'DAY' },
          referenceZdt,
        ),
      ).toThrow('Amount is required');
    });
  });

  describe('THIS direction', () => {
    it('should compute start and end for THIS MONTH', () => {
      const result = resolveRelativeDateFilter(
        { direction: 'THIS', amount: 1, unit: 'MONTH' },
        referenceZdt,
      );

      expect(result.start).toBe('2024-03-01');
      expect(result.end).toBe('2024-04-01');
    });

    it('should compute start and end for THIS YEAR', () => {
      const result = resolveRelativeDateFilter(
        { direction: 'THIS', amount: 1, unit: 'YEAR' },
        referenceZdt,
      );

      expect(result.start).toBe('2024-01-01');
      expect(result.end).toBe('2025-01-01');
    });
  });
});
