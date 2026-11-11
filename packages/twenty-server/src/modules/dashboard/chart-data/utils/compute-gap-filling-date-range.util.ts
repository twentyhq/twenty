import { Temporal } from 'temporal-polyfill';
import { type CalendarStartDay } from 'twenty-shared/constants';
import {
  type ChartFilter,
  type DashboardFilterBinding,
  type DashboardFilterValue,
  FirstDayOfTheWeek,
  type ObjectRecordGroupByDateGranularity,
  type PartialFieldMetadataItem,
} from 'twenty-shared/types';
import {
  convertCalendarStartDayNonIsoNumberToFirstDayOfTheWeek,
  getDashboardFilterCandidateFieldMetadataIds,
  getPeriodStart,
  isDefined,
  isNonEmptyArray,
  resolveDashboardFilterFieldForWidget,
} from 'twenty-shared/utils';

import { DATE_TIME_PERIOD_BY_GAP_FILLED_DATE_GRANULARITY } from 'src/modules/dashboard/chart-data/constants/date-time-period-by-gap-filled-date-granularity.constant';
import { type DateRangeBounds } from 'src/modules/dashboard/chart-data/types/date-range-bounds.type';
import { resolveDashboardFilterConditionsDateRange } from 'src/modules/dashboard/chart-data/utils/resolve-dashboard-filter-conditions-date-range.util';

export const computeGapFillingDateRange = ({
  dashboardFilterValues,
  dashboardFilterBindings,
  primaryAxisGroupByFieldMetadataId,
  primaryAxisGroupBySubFieldName,
  primaryAxisDateGranularity,
  widgetFilter,
  fields,
  timeZone,
  firstDayOfTheWeek,
  isQueryResultCutByLimit,
  now = Temporal.Now.instant(),
}: {
  dashboardFilterValues: DashboardFilterValue[] | null | undefined;
  dashboardFilterBindings: DashboardFilterBinding[] | null | undefined;
  primaryAxisGroupByFieldMetadataId: string;
  primaryAxisGroupBySubFieldName: string | null | undefined;
  primaryAxisDateGranularity:
    | ObjectRecordGroupByDateGranularity
    | null
    | undefined;
  widgetFilter: ChartFilter | null | undefined;
  fields: Pick<PartialFieldMetadataItem, 'id' | 'name' | 'type'>[];
  timeZone: string;
  firstDayOfTheWeek: CalendarStartDay;
  isQueryResultCutByLimit: boolean;
  now?: Temporal.Instant;
}): DateRangeBounds | undefined => {
  const period = isDefined(primaryAxisDateGranularity)
    ? DATE_TIME_PERIOD_BY_GAP_FILLED_DATE_GRANULARITY[
        primaryAxisDateGranularity
      ]
    : undefined;

  // An extension must never draw zeros over data the query did not return
  if (
    isQueryResultCutByLimit ||
    !isNonEmptyArray(dashboardFilterValues) ||
    isDefined(primaryAxisGroupBySubFieldName) ||
    !isDefined(period)
  ) {
    return undefined;
  }

  const weekStart = convertCalendarStartDayNonIsoNumberToFirstDayOfTheWeek(
    firstDayOfTheWeek,
    FirstDayOfTheWeek.MONDAY,
  );

  const valuesOnDateAxis = dashboardFilterValues.filter(
    ({ pageLayoutFilterId, type }) =>
      resolveDashboardFilterFieldForWidget({
        pageLayoutFilterId,
        filterType: type,
        bindings: dashboardFilterBindings,
        ...getDashboardFilterCandidateFieldMetadataIds({
          groupByFieldMetadataId: primaryAxisGroupByFieldMetadataId,
          filter: widgetFilter,
        }),
        fields,
      }).fieldMetadataId === primaryAxisGroupByFieldMetadataId,
  );

  const primaryAxisField = fields.find(
    ({ id }) => id === primaryAxisGroupByFieldMetadataId,
  );

  if (!isNonEmptyArray(valuesOnDateAxis) || !isDefined(primaryAxisField)) {
    return undefined;
  }

  const { start, end } = resolveDashboardFilterConditionsDateRange({
    conditions: valuesOnDateAxis.flatMap(({ conditions }) => conditions),
    fieldType: primaryAxisField.type,
    now: now.toZonedDateTimeISO(timeZone),
    firstDayOfTheWeek: weekStart,
  });

  const toBucketStart = (date: Temporal.PlainDate | null) =>
    isDefined(date)
      ? getPeriodStart(
          date.toZonedDateTime(timeZone),
          period,
          weekStart,
        ).toPlainDate()
      : null;

  return { start: toBucketStart(start), end: toBucketStart(end) };
};
