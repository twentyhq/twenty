import {
  addDays,
  addHours,
  addMinutes,
  addMonths,
  addSeconds,
  addWeeks,
  addYears,
  subDays,
  subHours,
  subMinutes,
  subMonths,
  subSeconds,
  subWeeks,
  subYears,
} from 'date-fns';
import { FirstDayOfTheWeek } from 'twenty-shared/types';
import { type RelativeDateFilter } from 'twenty-shared/utils';

import {
  evaluateRelativeDateFilter,
  parseAndEvaluateRelativeDateFilter,
} from 'src/modules/workflow/workflow-executor/workflow-actions/filter/utils/parse-and-evaluate-relative-date-filter.util';

// TODO: this test should be in twenty-shared, and the logic that is duplicated both front end and back end,
//  should be merged and properly refactored with Temporal to unify and simplify this bug-prone zone of the codebase.
describe('Relative Date Filter Utils', () => {
  const now = new Date('2024-01-15T12:00:00Z'); // Monday, January 15, 2024 at noon

  beforeEach(() => {
    // Mock Date constructor to return a fixed date for consistent testing
    jest.useFakeTimers();
    jest.setSystemTime(now);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('parseAndEvaluateRelativeDateFilter', () => {
    describe('Edge cases', () => {
      it('should handle invalid JSON gracefully', () => {
        const invalidJson = 'invalid json';

        expect(
          parseAndEvaluateRelativeDateFilter({
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
          parseAndEvaluateRelativeDateFilter({
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
          parseAndEvaluateRelativeDateFilter({
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
          parseAndEvaluateRelativeDateFilter({
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
          parseAndEvaluateRelativeDateFilter({
            dateToCheck: now,
            relativeDateString,
          }),
        ).toBe(false);
      });
    });
  });

  describe('evaluateRelativeDateFilter', () => {
    describe('NEXT direction', () => {
      it('should return true for dates within the next N seconds', () => {
        const relativeDateFilterValue: RelativeDateFilter = {
          direction: 'NEXT',
          amount: 3,
          unit: 'SECOND',
        };

        // Dates within the next 3 seconds should match
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: addSeconds(now, 1),
            relativeDateFilterValue,
          }),
        ).toBe(true);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: addSeconds(now, 2),
            relativeDateFilterValue,
          }),
        ).toBe(true);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: addSeconds(now, 3),
            relativeDateFilterValue,
          }),
        ).toBe(true);

        // Dates outside the range should not match
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: addSeconds(now, 4),
            relativeDateFilterValue,
          }),
        ).toBe(false);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: subSeconds(now, 1),
            relativeDateFilterValue,
          }),
        ).toBe(false);
      });

      it('should return true for dates within the next N minutes', () => {
        const relativeDateFilterValue: RelativeDateFilter = {
          direction: 'NEXT',
          amount: 3,
          unit: 'MINUTE',
        };

        // Dates within the next 3 minutes should match
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: addMinutes(now, 1),
            relativeDateFilterValue,
          }),
        ).toBe(true);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: addMinutes(now, 2),
            relativeDateFilterValue,
          }),
        ).toBe(true);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: addMinutes(now, 3),
            relativeDateFilterValue,
          }),
        ).toBe(true);

        // Dates outside the range should not match
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: addMinutes(now, 4),
            relativeDateFilterValue,
          }),
        ).toBe(false);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: subMinutes(now, 1),
            relativeDateFilterValue,
          }),
        ).toBe(false);
      });

      it('should return true for dates within the next N hours', () => {
        ///
        const relativeDateFilterValue: RelativeDateFilter = {
          direction: 'NEXT',
          amount: 3,
          unit: 'HOUR',
        };

        // Dates within the next 3 hours should match
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: addHours(now, 1),
            relativeDateFilterValue,
          }),
        ).toBe(true);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: addHours(now, 2),
            relativeDateFilterValue,
          }),
        ).toBe(true);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: addHours(now, 3),
            relativeDateFilterValue,
          }),
        ).toBe(true);

        // Dates outside the range should not match
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: addHours(now, 4),
            relativeDateFilterValue,
          }),
        ).toBe(false);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: subHours(now, 1),
            relativeDateFilterValue,
          }),
        ).toBe(false);
      });

      it('should return true for dates within the next N days', () => {
        const relativeDateFilterValue: RelativeDateFilter = {
          direction: 'NEXT',
          amount: 3,
          unit: 'DAY',
        };

        // Dates within the next 3 days should match
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: addDays(now, 1),
            relativeDateFilterValue,
          }),
        ).toBe(true);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: addDays(now, 2),
            relativeDateFilterValue,
          }),
        ).toBe(true);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: addDays(now, 3),
            relativeDateFilterValue,
          }),
        ).toBe(true);

        // Dates outside the range should not match
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: addDays(now, 4),
            relativeDateFilterValue,
          }),
        ).toBe(false);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: subDays(now, 1),
            relativeDateFilterValue,
          }),
        ).toBe(false);
      });

      it('should return true for dates within the next N weeks', () => {
        const relativeDateFilterValue: RelativeDateFilter = {
          direction: 'NEXT',
          amount: 2,
          unit: 'WEEK',
        };

        // Dates within the next 2 weeks should match
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: addWeeks(now, 1),
            relativeDateFilterValue,
          }),
        ).toBe(true);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: addDays(now, 10),
            relativeDateFilterValue,
          }),
        ).toBe(true);

        // Dates outside the range should not match
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: addWeeks(now, 3),
            relativeDateFilterValue,
          }),
        ).toBe(false);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: subDays(now, 1),
            relativeDateFilterValue,
          }),
        ).toBe(false);
      });

      it('should return true for dates within the next N months', () => {
        const relativeDateFilterValue: RelativeDateFilter = {
          direction: 'NEXT',
          amount: 2,
          unit: 'MONTH',
        };

        // Dates within the next 2 months should match
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: addMonths(now, 1),
            relativeDateFilterValue,
          }),
        ).toBe(true);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: addDays(now, 45),
            relativeDateFilterValue,
          }),
        ).toBe(true);

        // Dates outside the range should not match
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: addMonths(now, 3),
            relativeDateFilterValue,
          }),
        ).toBe(false);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: subDays(now, 1),
            relativeDateFilterValue,
          }),
        ).toBe(false);
      });

      it('should return true for dates within the next N years', () => {
        const relativeDateFilterValue: RelativeDateFilter = {
          direction: 'NEXT',
          amount: 1,
          unit: 'YEAR',
        };

        // Dates within the next year should match
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: addMonths(now, 6),
            relativeDateFilterValue,
          }),
        ).toBe(true);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: addMonths(now, 11),
            relativeDateFilterValue,
          }),
        ).toBe(true);

        // Dates outside the range should not match
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: addYears(now, 2),
            relativeDateFilterValue,
          }),
        ).toBe(false);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: subDays(now, 1),
            relativeDateFilterValue,
          }),
        ).toBe(false);
      });

      it('should return false when amount is undefined', () => {
        const relativeDateFilterValue: RelativeDateFilter = {
          direction: 'NEXT',
          unit: 'DAY',
        };

        expect(
          evaluateRelativeDateFilter({
            dateToCheck: addDays(now, 1),
            relativeDateFilterValue,
          }),
        ).toBe(false);
      });
    });

    describe('PAST direction', () => {
      it('should return true for dates within the past N seconds', () => {
        const relativeDateFilterValue: RelativeDateFilter = {
          direction: 'PAST',
          amount: 3,
          unit: 'SECOND',
        };

        // Dates within the past 3 seconds should match
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: subSeconds(now, 1),
            relativeDateFilterValue,
          }),
        ).toBe(true);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: subSeconds(now, 2),
            relativeDateFilterValue,
          }),
        ).toBe(true);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: subSeconds(now, 3),
            relativeDateFilterValue,
          }),
        ).toBe(true);

        // Dates outside the range should not match
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: subSeconds(now, 4),
            relativeDateFilterValue,
          }),
        ).toBe(false);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: addSeconds(now, 1),
            relativeDateFilterValue,
          }),
        ).toBe(false);
      });

      it('should return true for dates within the past N minutes', () => {
        const relativeDateFilterValue: RelativeDateFilter = {
          direction: 'PAST',
          amount: 3,
          unit: 'MINUTE',
        };

        // Dates within the past 3 minutes should match
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: subMinutes(now, 1),
            relativeDateFilterValue,
          }),
        ).toBe(true);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: subMinutes(now, 2),
            relativeDateFilterValue,
          }),
        ).toBe(true);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: subMinutes(now, 3),
            relativeDateFilterValue,
          }),
        ).toBe(true);

        // Dates outside the range should not match
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: subMinutes(now, 4),
            relativeDateFilterValue,
          }),
        ).toBe(false);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: addMinutes(now, 1),
            relativeDateFilterValue,
          }),
        ).toBe(false);
      });

      it('should return true for dates within the past N hours', () => {
        const relativeDateFilterValue: RelativeDateFilter = {
          direction: 'PAST',
          amount: 3,
          unit: 'HOUR',
        };

        // Dates within the past 3 hours should match
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: subHours(now, 1),
            relativeDateFilterValue,
          }),
        ).toBe(true);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: subHours(now, 2),
            relativeDateFilterValue,
          }),
        ).toBe(true);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: subHours(now, 3),
            relativeDateFilterValue,
          }),
        ).toBe(true);

        // Dates outside the range should not match
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: subHours(now, 4),
            relativeDateFilterValue,
          }),
        ).toBe(false);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: addHours(now, 1),
            relativeDateFilterValue,
          }),
        ).toBe(false);
      });

      it('should return true for dates within the past N days', () => {
        const relativeDateFilterValue: RelativeDateFilter = {
          direction: 'PAST',
          amount: 3,
          unit: 'DAY',
        };

        // Dates within the past 3 days should match
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: subDays(now, 1),
            relativeDateFilterValue,
          }),
        ).toBe(true);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: subDays(now, 2),
            relativeDateFilterValue,
          }),
        ).toBe(true);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: subDays(now, 3),
            relativeDateFilterValue,
          }),
        ).toBe(true);

        // Dates outside the range should not match
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: subDays(now, 4),
            relativeDateFilterValue,
          }),
        ).toBe(false);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: addDays(now, 1),
            relativeDateFilterValue,
          }),
        ).toBe(false);
      });

      it('should return true for dates within the past N weeks', () => {
        const relativeDateFilterValue: RelativeDateFilter = {
          direction: 'PAST',
          amount: 2,
          unit: 'WEEK',
        };

        // Dates within the past 2 weeks should match
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: subWeeks(now, 1),
            relativeDateFilterValue,
          }),
        ).toBe(true);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: subDays(now, 10),
            relativeDateFilterValue,
          }),
        ).toBe(true);

        // Dates outside the range should not match
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: subWeeks(now, 3),
            relativeDateFilterValue,
          }),
        ).toBe(false);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: addDays(now, 1),
            relativeDateFilterValue,
          }),
        ).toBe(false);
      });

      it('should return true for dates within the past N months', () => {
        const relativeDateFilterValue: RelativeDateFilter = {
          direction: 'PAST',
          amount: 2,
          unit: 'MONTH',
        };

        // Dates within the past 2 months should match
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: subMonths(now, 1),
            relativeDateFilterValue,
          }),
        ).toBe(true);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: subDays(now, 45),
            relativeDateFilterValue,
          }),
        ).toBe(true);

        // Dates outside the range should not match
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: subMonths(now, 3),
            relativeDateFilterValue,
          }),
        ).toBe(false);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: addDays(now, 1),
            relativeDateFilterValue,
          }),
        ).toBe(false);
      });

      it('should return true for dates within the past N years', () => {
        const relativeDateFilterValue: RelativeDateFilter = {
          direction: 'PAST',
          amount: 1,
          unit: 'YEAR',
        };

        // Dates within the past year should match
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: subMonths(now, 6),
            relativeDateFilterValue,
          }),
        ).toBe(true);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: subMonths(now, 11),
            relativeDateFilterValue,
          }),
        ).toBe(true);

        // Dates outside the range should not match
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: subYears(now, 2),
            relativeDateFilterValue,
          }),
        ).toBe(false);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: addDays(now, 1),
            relativeDateFilterValue,
          }),
        ).toBe(false);
      });

      it('should return false when amount is undefined', () => {
        const relativeDateFilterValue: RelativeDateFilter = {
          direction: 'PAST',
          unit: 'DAY',
        };

        expect(
          evaluateRelativeDateFilter({
            dateToCheck: subDays(now, 1),
            relativeDateFilterValue,
          }),
        ).toBe(false);
      });
    });

    describe('THIS direction', () => {
      it('should return true for dates within this second', () => {
        const relativeDateFilterValue: RelativeDateFilter = {
          direction: 'THIS',
          unit: 'SECOND',
        };

        // Same second should match
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: now,
            relativeDateFilterValue,
          }),
        ).toBe(true);

        // Different seconds should not match
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: new Date('2024-01-15T08:00:00Z'),
            relativeDateFilterValue,
          }),
        ).toBe(false);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: subSeconds(now, 1),
            relativeDateFilterValue,
          }),
        ).toBe(false);
      });

      it('should return true for dates within this minute', () => {
        const relativeDateFilterValue: RelativeDateFilter = {
          direction: 'THIS',
          unit: 'MINUTE',
        };

        // Same minute should match
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: now,
            relativeDateFilterValue,
          }),
        ).toBe(true);

        // Different minutes should not match
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: new Date('2024-01-15T08:00:00Z'),
            relativeDateFilterValue,
          }),
        ).toBe(false);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: subMinutes(now, 1),
            relativeDateFilterValue,
          }),
        ).toBe(false);
      });

      it('should return true for dates within this hour', () => {
        const relativeDateFilterValue: RelativeDateFilter = {
          direction: 'THIS',
          unit: 'HOUR',
        };

        // Same hour should match
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: now,
            relativeDateFilterValue,
          }),
        ).toBe(true);

        // Different hours should not match
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: new Date('2024-01-15T08:00:00Z'),
            relativeDateFilterValue,
          }),
        ).toBe(false);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: subHours(now, 1),
            relativeDateFilterValue,
          }),
        ).toBe(false);
      });

      it('should return true for dates within this day', () => {
        const relativeDateFilterValue: RelativeDateFilter = {
          direction: 'THIS',
          unit: 'DAY',
        };

        // Same day should match
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: now,
            relativeDateFilterValue,
          }),
        ).toBe(true);
        // TODO: this test fails if the exec env is not UTC, should be replaced by Temporal soon
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: new Date('2024-01-15T08:00:00Z'),
            relativeDateFilterValue,
          }),
        ).toBe(true);

        // Different days should not match
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: subDays(now, 1),
            relativeDateFilterValue,
          }),
        ).toBe(false);
      });

      it('should return true for dates within this week', () => {
        const relativeDateFilterValue: RelativeDateFilter = {
          direction: 'THIS',
          unit: 'WEEK',
          firstDayOfTheWeek: FirstDayOfTheWeek.MONDAY,
        };

        expect(
          evaluateRelativeDateFilter({
            dateToCheck: now,
            relativeDateFilterValue,
          }),
        ).toBe(true);

        expect(
          evaluateRelativeDateFilter({
            dateToCheck: new Date('2024-01-16T12:00:00Z'),
            relativeDateFilterValue,
          }),
        ).toBe(true);

        expect(
          evaluateRelativeDateFilter({
            dateToCheck: new Date('2024-01-20T12:00:00Z'),
            relativeDateFilterValue,
          }),
        ).toBe(true);

        // Different weeks should not match
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: new Date('2024-01-13T12:00:00Z'),
            relativeDateFilterValue,
          }),
        ).toBe(false);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: new Date('2024-01-22T12:00:00Z'),
            relativeDateFilterValue,
          }),
        ).toBe(false);
      });

      it('should return true for dates within this month', () => {
        const relativeDateFilterValue: RelativeDateFilter = {
          direction: 'THIS',
          unit: 'MONTH',
        };

        // Same month should match
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: now,
            relativeDateFilterValue,
          }),
        ).toBe(true);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: new Date('2024-01-01T12:00:00Z'),
            relativeDateFilterValue,
          }),
        ).toBe(true);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: new Date('2024-01-31T12:00:00Z'),
            relativeDateFilterValue,
          }),
        ).toBe(true);

        // Different months should not match
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: new Date('2023-12-31T12:00:00Z'),
            relativeDateFilterValue,
          }),
        ).toBe(false);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: new Date('2024-02-01T12:00:00Z'),
            relativeDateFilterValue,
          }),
        ).toBe(false);
      });

      it('should return true for dates within this year', () => {
        const relativeDateFilterValue: RelativeDateFilter = {
          direction: 'THIS',
          unit: 'YEAR',
        };

        // Same year should match
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: now,
            relativeDateFilterValue,
          }),
        ).toBe(true);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: new Date('2024-01-01T12:00:00Z'),
            relativeDateFilterValue,
          }),
        ).toBe(true);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: new Date('2024-12-31T12:00:00Z'),
            relativeDateFilterValue,
          }),
        ).toBe(true);

        // Different years should not match
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: new Date('2023-12-31T12:00:00Z'),
            relativeDateFilterValue,
          }),
        ).toBe(false);
        expect(
          evaluateRelativeDateFilter({
            dateToCheck: new Date('2025-01-01T12:00:00Z'),
            relativeDateFilterValue,
          }),
        ).toBe(false);
      });
    });
  });
});
