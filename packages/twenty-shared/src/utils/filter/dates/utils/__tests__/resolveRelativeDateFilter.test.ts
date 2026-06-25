import { Temporal } from 'temporal-polyfill';

import { FirstDayOfTheWeek } from '@/types';
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

    it('should compute start and end for THIS QUARTER', () => {
      const result = resolveRelativeDateFilter(
        { direction: 'THIS', amount: 1, unit: 'QUARTER' },
        referenceZdt,
      );

      expect(result.start).toBe('2024-01-01');
      expect(result.end).toBe('2024-04-01');
    });

    it('should compute start and end for PAST 1 QUARTER', () => {
      const result = resolveRelativeDateFilter(
        { direction: 'PAST', amount: 1, unit: 'QUARTER' },
        referenceZdt,
      );

      expect(result.start).toBe('2023-10-01');
      expect(result.end).toBe('2024-01-01');
    });

    it('should compute start and end for NEXT 1 QUARTER', () => {
      const result = resolveRelativeDateFilter(
        { direction: 'NEXT', amount: 1, unit: 'QUARTER' },
        referenceZdt,
      );

      expect(result.start).toBe('2024-04-01');
      expect(result.end).toBe('2024-07-01');
    });
  });

  // Issue #19739: PAST/NEXT must be calendar-aligned for every unit, not just
  // QUARTER. referenceZdt is Friday 2024-03-15; the default week starts Monday,
  // so the current week starts Monday 2024-03-11.
  describe('calendar-aligned PAST/NEXT for week/month/year', () => {
    it('should compute PAST 1 WEEK as the previous calendar week', () => {
      const result = resolveRelativeDateFilter(
        { direction: 'PAST', amount: 1, unit: 'WEEK' },
        referenceZdt,
      );

      expect(result.start).toBe('2024-03-04');
      expect(result.end).toBe('2024-03-11');
    });

    it('should compute NEXT 1 WEEK as the next calendar week', () => {
      const result = resolveRelativeDateFilter(
        { direction: 'NEXT', amount: 1, unit: 'WEEK' },
        referenceZdt,
      );

      expect(result.start).toBe('2024-03-18');
      expect(result.end).toBe('2024-03-25');
    });

    it('should respect firstDayOfTheWeek when aligning PAST 1 WEEK', () => {
      const result = resolveRelativeDateFilter(
        {
          direction: 'PAST',
          amount: 1,
          unit: 'WEEK',
          firstDayOfTheWeek: FirstDayOfTheWeek.SUNDAY,
        },
        referenceZdt,
      );

      expect(result.start).toBe('2024-03-03');
      expect(result.end).toBe('2024-03-10');
    });

    it('should compute PAST 1 MONTH as the previous calendar month', () => {
      const result = resolveRelativeDateFilter(
        { direction: 'PAST', amount: 1, unit: 'MONTH' },
        referenceZdt,
      );

      expect(result.start).toBe('2024-02-01');
      expect(result.end).toBe('2024-03-01');
    });

    it('should compute NEXT 1 MONTH as the next calendar month', () => {
      const result = resolveRelativeDateFilter(
        { direction: 'NEXT', amount: 1, unit: 'MONTH' },
        referenceZdt,
      );

      expect(result.start).toBe('2024-04-01');
      expect(result.end).toBe('2024-05-01');
    });

    it('should compute PAST 1 YEAR as the previous calendar year', () => {
      const result = resolveRelativeDateFilter(
        { direction: 'PAST', amount: 1, unit: 'YEAR' },
        referenceZdt,
      );

      expect(result.start).toBe('2023-01-01');
      expect(result.end).toBe('2024-01-01');
    });

    it('should compute NEXT 1 YEAR as the next calendar year', () => {
      const result = resolveRelativeDateFilter(
        { direction: 'NEXT', amount: 1, unit: 'YEAR' },
        referenceZdt,
      );

      expect(result.start).toBe('2025-01-01');
      expect(result.end).toBe('2026-01-01');
    });
  });
});
