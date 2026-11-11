import { Temporal } from 'temporal-polyfill';
import { CalendarStartDay } from 'twenty-shared/constants';
import {
  type DashboardFilterValue,
  FieldMetadataType,
  ObjectRecordGroupByDateGranularity,
  PageLayoutFilterType,
  type PageLayoutFilterCondition,
  ViewFilterOperand,
} from 'twenty-shared/types';

import { computeGapFillingDateRange } from 'src/modules/dashboard/chart-data/utils/compute-gap-filling-date-range.util';

const DATE_RANGE_FILTER_ID = 'date-range-filter-id';
const CLOSE_DATE_FIELD = {
  id: 'close-date-field-id',
  name: 'closeDate',
  type: FieldMetadataType.DATE,
};
const CREATED_AT_FIELD = {
  id: 'created-at-field-id',
  name: 'createdAt',
  type: FieldMetadataType.DATE_TIME,
};

const LATE_EVENING_IN_UTC = Temporal.Instant.from('2026-03-11T23:30:00Z');

const dateRangeValue = (
  conditions: PageLayoutFilterCondition[],
): DashboardFilterValue[] => [
  {
    pageLayoutFilterId: DATE_RANGE_FILTER_ID,
    type: PageLayoutFilterType.DATE,
    conditions,
  },
];

const JANUARY_15_TO_MARCH_10 = dateRangeValue([
  { operand: ViewFilterOperand.IS_AFTER, value: '2026-01-15' },
  { operand: ViewFilterOperand.IS_BEFORE, value: '2026-03-11' },
]);

const computeRange = (
  overrides: Partial<Parameters<typeof computeGapFillingDateRange>[0]>,
) => {
  const range = computeGapFillingDateRange({
    dashboardFilterValues: JANUARY_15_TO_MARCH_10,
    dashboardFilterBindings: null,
    primaryAxisGroupByFieldMetadataId: CLOSE_DATE_FIELD.id,
    primaryAxisGroupBySubFieldName: null,
    primaryAxisDateGranularity: ObjectRecordGroupByDateGranularity.MONTH,
    widgetFilter: null,
    fields: [CLOSE_DATE_FIELD, CREATED_AT_FIELD],
    timeZone: 'UTC',
    firstDayOfTheWeek: CalendarStartDay.MONDAY,
    isQueryResultCutByLimit: false,
    now: LATE_EVENING_IN_UTC,
    ...overrides,
  });

  return (
    range && {
      start: range.start?.toString() ?? null,
      end: range.end?.toString() ?? null,
    }
  );
};

describe('computeGapFillingDateRange', () => {
  it('should align both sides of the range to the buckets of the date axis', () => {
    expect(computeRange({})).toEqual({
      start: '2026-01-01',
      end: '2026-03-01',
    });
  });

  it("should align weeks to the widget's first day of the week", () => {
    expect(
      computeRange({
        primaryAxisDateGranularity: ObjectRecordGroupByDateGranularity.WEEK,
        firstDayOfTheWeek: CalendarStartDay.SUNDAY,
      }),
    ).toEqual({ start: '2026-01-11', end: '2026-03-08' });
  });

  it('should span a Date range wider than the period it replaces on the axis', () => {
    expect(
      computeRange({
        dashboardFilterValues: dateRangeValue([
          { operand: ViewFilterOperand.IS_RELATIVE, value: 'PAST_90_DAY' },
        ]),
        widgetFilter: {
          recordFilters: [
            {
              fieldMetadataId: CLOSE_DATE_FIELD.id,
              operand: ViewFilterOperand.IS_RELATIVE,
              value: 'THIS_1_MONTH',
            },
          ],
        },
        primaryAxisDateGranularity: ObjectRecordGroupByDateGranularity.DAY,
      }),
    ).toEqual({ start: '2025-12-11', end: '2026-03-10' });
  });

  it('should keep an open side open', () => {
    expect(
      computeRange({
        dashboardFilterValues: dateRangeValue([
          { operand: ViewFilterOperand.IS_AFTER, value: '2026-02-20' },
        ]),
        primaryAxisDateGranularity: ObjectRecordGroupByDateGranularity.DAY,
      }),
    ).toEqual({ start: '2026-02-20', end: null });
  });

  it('should resolve relative values in the given time zone', () => {
    const computeToday = (timeZone: string) =>
      computeRange({
        dashboardFilterValues: dateRangeValue([
          { operand: ViewFilterOperand.IS_TODAY, value: '' },
        ]),
        primaryAxisDateGranularity: ObjectRecordGroupByDateGranularity.DAY,
        timeZone,
      });

    expect(computeToday('UTC')).toEqual({
      start: '2026-03-11',
      end: '2026-03-11',
    });
    expect(computeToday('Asia/Tokyo')).toEqual({
      start: '2026-03-12',
      end: '2026-03-12',
    });
  });

  it.each([
    ['no dashboard filter value', { dashboardFilterValues: [] }],
    ['a query result cut by its limit', { isQueryResultCutByLimit: true }],
    ['a sub-field date axis', { primaryAxisGroupBySubFieldName: 'closeDate' }],
    ['no granularity', { primaryAxisDateGranularity: undefined }],
    [
      'a granularity without gap filling',
      {
        primaryAxisDateGranularity:
          ObjectRecordGroupByDateGranularity.DAY_OF_THE_WEEK,
      },
    ],
    [
      'a filter overridden to another field',
      {
        dashboardFilterBindings: [
          {
            pageLayoutFilterId: DATE_RANGE_FILTER_ID,
            fieldMetadataId: CREATED_AT_FIELD.id,
          },
        ],
      },
    ],
    [
      'a filter not applied to the widget',
      {
        dashboardFilterBindings: [
          { pageLayoutFilterId: DATE_RANGE_FILTER_ID, fieldMetadataId: null },
        ],
      },
    ],
  ])('should not extend the axis for %s', (_title, overrides) => {
    expect(computeRange(overrides)).toBeUndefined();
  });
});
