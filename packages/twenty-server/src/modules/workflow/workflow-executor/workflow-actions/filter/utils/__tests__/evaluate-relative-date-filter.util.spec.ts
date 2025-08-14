import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  subDays,
  subMonths,
  subWeeks,
  subYears,
} from 'date-fns';

import { evaluateRelativeDateFilter } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/utils/evaluate-relative-date-filter.util';

describe('evaluateRelativeDateFilter', () => {
  const now = new Date('2024-01-15T12:00:00Z'); // Monday, January 15, 2024 at noon

  beforeEach(() => {
    // Mock Date constructor to return a fixed date for consistent testing
    jest.useFakeTimers();
    jest.setSystemTime(now);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('NEXT direction', () => {
    it('should return true for dates within the next N days', () => {
      const relativeDateString = JSON.stringify({
        direction: 'NEXT',
        amount: 3,
        unit: 'DAY',
      });

      // Dates within the next 3 days should match
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: addDays(now, 1),
          relativeDateString,
        }),
      ).toBe(true);
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: addDays(now, 2),
          relativeDateString,
        }),
      ).toBe(true);
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: addDays(now, 3),
          relativeDateString,
        }),
      ).toBe(true);

      // Dates outside the range should not match
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: addDays(now, 4),
          relativeDateString,
        }),
      ).toBe(false);
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: subDays(now, 1),
          relativeDateString,
        }),
      ).toBe(false);
    });

    it('should return true for dates within the next N weeks', () => {
      const relativeDateString = JSON.stringify({
        direction: 'NEXT',
        amount: 2,
        unit: 'WEEK',
      });

      // Dates within the next 2 weeks should match
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: addWeeks(now, 1),
          relativeDateString,
        }),
      ).toBe(true);
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: addDays(now, 10),
          relativeDateString,
        }),
      ).toBe(true);

      // Dates outside the range should not match
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: addWeeks(now, 3),
          relativeDateString,
        }),
      ).toBe(false);
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: subDays(now, 1),
          relativeDateString,
        }),
      ).toBe(false);
    });

    it('should return true for dates within the next N months', () => {
      const relativeDateString = JSON.stringify({
        direction: 'NEXT',
        amount: 2,
        unit: 'MONTH',
      });

      // Dates within the next 2 months should match
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: addMonths(now, 1),
          relativeDateString,
        }),
      ).toBe(true);
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: addDays(now, 45),
          relativeDateString,
        }),
      ).toBe(true);

      // Dates outside the range should not match
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: addMonths(now, 3),
          relativeDateString,
        }),
      ).toBe(false);
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: subDays(now, 1),
          relativeDateString,
        }),
      ).toBe(false);
    });

    it('should return true for dates within the next N years', () => {
      const relativeDateString = JSON.stringify({
        direction: 'NEXT',
        amount: 1,
        unit: 'YEAR',
      });

      // Dates within the next year should match
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: addMonths(now, 6),
          relativeDateString,
        }),
      ).toBe(true);
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: addMonths(now, 11),
          relativeDateString,
        }),
      ).toBe(true);

      // Dates outside the range should not match
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: addYears(now, 2),
          relativeDateString,
        }),
      ).toBe(false);
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: subDays(now, 1),
          relativeDateString,
        }),
      ).toBe(false);
    });

    it('should return false when amount is undefined', () => {
      const relativeDateString = JSON.stringify({
        direction: 'NEXT',
        unit: 'DAY',
      });

      expect(
        evaluateRelativeDateFilter({
          dateToCheck: addDays(now, 1),
          relativeDateString,
        }),
      ).toBe(false);
    });
  });

  describe('PAST direction', () => {
    it('should return true for dates within the past N days', () => {
      const relativeDateString = JSON.stringify({
        direction: 'PAST',
        amount: 3,
        unit: 'DAY',
      });

      // Dates within the past 3 days should match
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: subDays(now, 1),
          relativeDateString,
        }),
      ).toBe(true);
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: subDays(now, 2),
          relativeDateString,
        }),
      ).toBe(true);
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: subDays(now, 3),
          relativeDateString,
        }),
      ).toBe(true);

      // Dates outside the range should not match
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: subDays(now, 4),
          relativeDateString,
        }),
      ).toBe(false);
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: addDays(now, 1),
          relativeDateString,
        }),
      ).toBe(false);
    });

    it('should return true for dates within the past N weeks', () => {
      const relativeDateString = JSON.stringify({
        direction: 'PAST',
        amount: 2,
        unit: 'WEEK',
      });

      // Dates within the past 2 weeks should match
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: subWeeks(now, 1),
          relativeDateString,
        }),
      ).toBe(true);
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: subDays(now, 10),
          relativeDateString,
        }),
      ).toBe(true);

      // Dates outside the range should not match
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: subWeeks(now, 3),
          relativeDateString,
        }),
      ).toBe(false);
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: addDays(now, 1),
          relativeDateString,
        }),
      ).toBe(false);
    });

    it('should return true for dates within the past N months', () => {
      const relativeDateString = JSON.stringify({
        direction: 'PAST',
        amount: 2,
        unit: 'MONTH',
      });

      // Dates within the past 2 months should match
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: subMonths(now, 1),
          relativeDateString,
        }),
      ).toBe(true);
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: subDays(now, 45),
          relativeDateString,
        }),
      ).toBe(true);

      // Dates outside the range should not match
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: subMonths(now, 3),
          relativeDateString,
        }),
      ).toBe(false);
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: addDays(now, 1),
          relativeDateString,
        }),
      ).toBe(false);
    });

    it('should return true for dates within the past N years', () => {
      const relativeDateString = JSON.stringify({
        direction: 'PAST',
        amount: 1,
        unit: 'YEAR',
      });

      // Dates within the past year should match
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: subMonths(now, 6),
          relativeDateString,
        }),
      ).toBe(true);
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: subMonths(now, 11),
          relativeDateString,
        }),
      ).toBe(true);

      // Dates outside the range should not match
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: subYears(now, 2),
          relativeDateString,
        }),
      ).toBe(false);
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: addDays(now, 1),
          relativeDateString,
        }),
      ).toBe(false);
    });

    it('should return false when amount is undefined', () => {
      const relativeDateString = JSON.stringify({
        direction: 'PAST',
        unit: 'DAY',
      });

      expect(
        evaluateRelativeDateFilter({
          dateToCheck: subDays(now, 1),
          relativeDateString,
        }),
      ).toBe(false);
    });
  });

  describe('THIS direction', () => {
    it('should return true for dates within this day', () => {
      const relativeDateString = JSON.stringify({
        direction: 'THIS',
        unit: 'DAY',
      });

      // Same day should match
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: now,
          relativeDateString,
        }),
      ).toBe(true);
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: new Date('2024-01-15T08:00:00Z'),
          relativeDateString,
        }),
      ).toBe(true);

      // Different days should not match
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: new Date('2024-01-14T20:00:00Z'),
          relativeDateString,
        }),
      ).toBe(false);
    });

    it('should return true for dates within this week', () => {
      const relativeDateString = JSON.stringify({
        direction: 'THIS',
        unit: 'WEEK',
      });

      // Same week should match (assuming week starts on Sunday)
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: now,
          relativeDateString,
        }),
      ).toBe(true);
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: new Date('2024-01-14T12:00:00Z'), // Sunday
          relativeDateString,
        }),
      ).toBe(true);
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: new Date('2024-01-20T12:00:00Z'), // Saturday
          relativeDateString,
        }),
      ).toBe(true);

      // Different weeks should not match
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: new Date('2024-01-13T12:00:00Z'), // Previous Saturday
          relativeDateString,
        }),
      ).toBe(false);
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: new Date('2024-01-21T12:00:00Z'), // Next Sunday
          relativeDateString,
        }),
      ).toBe(false);
    });

    it('should return true for dates within this month', () => {
      const relativeDateString = JSON.stringify({
        direction: 'THIS',
        unit: 'MONTH',
      });

      // Same month should match
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: now,
          relativeDateString,
        }),
      ).toBe(true);
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: new Date('2024-01-01T12:00:00Z'),
          relativeDateString,
        }),
      ).toBe(true);
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: new Date('2024-01-31T12:00:00Z'),
          relativeDateString,
        }),
      ).toBe(true);

      // Different months should not match
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: new Date('2023-12-31T12:00:00Z'),
          relativeDateString,
        }),
      ).toBe(false);
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: new Date('2024-02-01T12:00:00Z'),
          relativeDateString,
        }),
      ).toBe(false);
    });

    it('should return true for dates within this year', () => {
      const relativeDateString = JSON.stringify({
        direction: 'THIS',
        unit: 'YEAR',
      });

      // Same year should match
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: now,
          relativeDateString,
        }),
      ).toBe(true);
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: new Date('2024-01-01T12:00:00Z'),
          relativeDateString,
        }),
      ).toBe(true);
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: new Date('2024-12-31T12:00:00Z'),
          relativeDateString,
        }),
      ).toBe(true);

      // Different years should not match
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: new Date('2023-12-31T12:00:00Z'),
          relativeDateString,
        }),
      ).toBe(false);
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: new Date('2025-01-01T12:00:00Z'),
          relativeDateString,
        }),
      ).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle invalid JSON gracefully', () => {
      const invalidJson = 'invalid json';

      // Should return false for invalid input
      expect(
        evaluateRelativeDateFilter({
          dateToCheck: now,
          relativeDateString: invalidJson,
        }),
      ).toBe(false);
    });

    it('should handle missing direction gracefully', () => {
      const relativeDateString = JSON.stringify({
        amount: 1,
        unit: 'DAY',
      });

      expect(
        evaluateRelativeDateFilter({
          dateToCheck: now,
          relativeDateString,
        }),
      ).toBe(false);
    });

    it('should handle missing unit gracefully', () => {
      const relativeDateString = JSON.stringify({
        direction: 'NEXT',
        amount: 1,
      });

      expect(
        evaluateRelativeDateFilter({
          dateToCheck: now,
          relativeDateString,
        }),
      ).toBe(false);
    });

    it('should handle unknown direction gracefully', () => {
      const relativeDateString = JSON.stringify({
        direction: 'UNKNOWN',
        amount: 1,
        unit: 'DAY',
      });

      expect(
        evaluateRelativeDateFilter({
          dateToCheck: now,
          relativeDateString,
        }),
      ).toBe(false);
    });

    it('should handle unknown unit gracefully', () => {
      const relativeDateString = JSON.stringify({
        direction: 'NEXT',
        amount: 1,
        unit: 'UNKNOWN',
      });

      expect(
        evaluateRelativeDateFilter({
          dateToCheck: now,
          relativeDateString,
        }),
      ).toBe(false);
    });

    it('should handle missing amount for NEXT direction', () => {
      const relativeDateString = JSON.stringify({
        direction: 'NEXT',
        unit: 'DAY',
      });

      expect(
        evaluateRelativeDateFilter({
          dateToCheck: now,
          relativeDateString,
        }),
      ).toBe(false);
    });

    it('should handle missing amount for PAST direction', () => {
      const relativeDateString = JSON.stringify({
        direction: 'PAST',
        unit: 'DAY',
      });

      expect(
        evaluateRelativeDateFilter({
          dateToCheck: now,
          relativeDateString,
        }),
      ).toBe(false);
    });

    it('should handle boundary dates correctly', () => {
      const relativeDateString = JSON.stringify({
        direction: 'NEXT',
        amount: 1,
        unit: 'DAY',
      });

      // Exactly 1 day in the future should match
      const exactlyOneDayLater = addDays(now, 1);

      expect(
        evaluateRelativeDateFilter({
          dateToCheck: exactlyOneDayLater,
          relativeDateString,
        }),
      ).toBe(true);

      // Just over 1 day in the future should not match
      const justOverOneDayLater = new Date(exactlyOneDayLater.getTime() + 1000);

      expect(
        evaluateRelativeDateFilter({
          dateToCheck: justOverOneDayLater,
          relativeDateString,
        }),
      ).toBe(false);
    });
  });
});
