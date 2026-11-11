import { Temporal } from 'temporal-polyfill';
import {
  FieldMetadataType,
  FirstDayOfTheWeek,
  type PageLayoutFilterCondition,
  ViewFilterOperand,
} from 'twenty-shared/types';

import { resolveDashboardFilterConditionsDateRange } from 'src/modules/dashboard/chart-data/utils/resolve-dashboard-filter-conditions-date-range.util';

const WEDNESDAY_IN_PARIS = Temporal.ZonedDateTime.from(
  '2026-03-11T10:00:00[Europe/Paris]',
);

const resolveRange = (
  conditions: PageLayoutFilterCondition[],
  fieldType = FieldMetadataType.DATE_TIME,
) => {
  const { start, end } = resolveDashboardFilterConditionsDateRange({
    conditions,
    fieldType,
    now: WEDNESDAY_IN_PARIS,
    firstDayOfTheWeek: FirstDayOfTheWeek.MONDAY,
  });

  return { start: start?.toString() ?? null, end: end?.toString() ?? null };
};

describe('resolveDashboardFilterConditionsDateRange', () => {
  it.each<[string, PageLayoutFilterCondition[], string | null, string | null]>([
    [
      'a custom range, whose IS_BEFORE day is excluded',
      [
        { operand: ViewFilterOperand.IS_AFTER, value: '2026-01-01' },
        { operand: ViewFilterOperand.IS_BEFORE, value: '2026-02-01' },
      ],
      '2026-01-01',
      '2026-01-31',
    ],
    [
      'a single day',
      [{ operand: ViewFilterOperand.IS, value: '2026-02-14' }],
      '2026-02-14',
      '2026-02-14',
    ],
    [
      'today',
      [{ operand: ViewFilterOperand.IS_TODAY, value: '' }],
      '2026-03-11',
      '2026-03-11',
    ],
    [
      'the past, today included on a DATE_TIME field',
      [{ operand: ViewFilterOperand.IS_IN_PAST, value: '' }],
      null,
      '2026-03-11',
    ],
    [
      'the future',
      [{ operand: ViewFilterOperand.IS_IN_FUTURE, value: '' }],
      '2026-03-11',
      null,
    ],
    [
      'the past 30 days, today excluded',
      [{ operand: ViewFilterOperand.IS_RELATIVE, value: 'PAST_30_DAY' }],
      '2026-02-09',
      '2026-03-10',
    ],
    [
      'the next 2 months',
      [{ operand: ViewFilterOperand.IS_RELATIVE, value: 'NEXT_2_MONTH' }],
      '2026-04-01',
      '2026-05-31',
    ],
    [
      "this week, starting on the widget's first day",
      [{ operand: ViewFilterOperand.IS_RELATIVE, value: 'THIS_1_WEEK' }],
      '2026-03-09',
      '2026-03-15',
    ],
    [
      'this week, starting on the first day the value carries',
      [
        {
          operand: ViewFilterOperand.IS_RELATIVE,
          value: 'THIS_1_WEEK;;Europe/Paris;;SUNDAY;;',
        },
      ],
      '2026-03-08',
      '2026-03-14',
    ],
    [
      'a condition without dates',
      [{ operand: ViewFilterOperand.IS_NOT_EMPTY, value: '' }],
      null,
      null,
    ],
    [
      'the intersection of its conditions',
      [
        { operand: ViewFilterOperand.IS_AFTER, value: '2026-01-01' },
        { operand: ViewFilterOperand.IS_AFTER, value: '2026-01-10' },
        { operand: ViewFilterOperand.IS_BEFORE, value: '2026-03-01' },
        { operand: ViewFilterOperand.IS_BEFORE, value: '2026-02-01' },
      ],
      '2026-01-10',
      '2026-01-31',
    ],
  ])('should resolve %s', (_title, conditions, expectedStart, expectedEnd) => {
    expect(resolveRange(conditions)).toEqual({
      start: expectedStart,
      end: expectedEnd,
    });
  });

  it('should end the past at yesterday on a DATE field, whose query excludes today', () => {
    expect(
      resolveRange(
        [{ operand: ViewFilterOperand.IS_IN_PAST, value: '' }],
        FieldMetadataType.DATE,
      ),
    ).toEqual({ start: null, end: '2026-03-10' });
  });
});
