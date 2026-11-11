import { setupI18n } from '@lingui/core';
import { Temporal } from 'temporal-polyfill';
import { CalendarStartDay } from 'twenty-shared/constants';
import {
  AggregateOperations,
  FieldMetadataType,
  ObjectRecordGroupByDateGranularity,
} from 'twenty-shared/types';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { BarChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/bar-chart-configuration.dto';
import { BarChartGroupMode } from 'src/engine/metadata-modules/page-layout-widget/enums/bar-chart-group-mode.enum';
import { BarChartLayout } from 'src/engine/metadata-modules/page-layout-widget/enums/bar-chart-layout.enum';
import { GraphOrderBy } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-order-by.enum';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { type DateRangeBounds } from 'src/modules/dashboard/chart-data/types/date-range-bounds.type';
import { transformToTwoDimensionalBarChartData } from 'src/modules/dashboard/chart-data/utils/transform-to-two-dimensional-bar-chart-data.util';

const CLOSE_DATE_FIELD = getFlatFieldMetadataMock({
  universalIdentifier: 'close-date-universal-identifier',
  objectMetadataId: 'opportunity-object-id',
  type: FieldMetadataType.DATE,
  name: 'closeDate',
});
const STAGE_FIELD = getFlatFieldMetadataMock({
  universalIdentifier: 'stage-universal-identifier',
  objectMetadataId: 'opportunity-object-id',
  type: FieldMetadataType.TEXT,
  name: 'stage',
});
const AMOUNT_FIELD = getFlatFieldMetadataMock({
  universalIdentifier: 'amount-universal-identifier',
  objectMetadataId: 'opportunity-object-id',
  type: FieldMetadataType.NUMBER,
  name: 'amount',
});

const DATA_DAYS = Array.from({ length: 10 }, (_, index) =>
  Temporal.PlainDate.from('2026-11-01').add({ days: index }).toString(),
);

const buildRawResults = (stages: string[]) =>
  DATA_DAYS.flatMap((day) =>
    stages.map((stage) => ({
      groupByDimensionValues: [day, stage],
      aggregateValue: 1,
    })),
  );

const PAST_30_DAYS: DateRangeBounds = {
  start: Temporal.PlainDate.from('2026-10-12'),
  end: Temporal.PlainDate.from('2026-11-10'),
};

const THIS_MONTH: DateRangeBounds = {
  start: Temporal.PlainDate.from('2026-11-01'),
  end: Temporal.PlainDate.from('2026-11-30'),
};

const transformDays = ({
  stages,
  groupMode,
  primaryAxisOrderBy = GraphOrderBy.FIELD_ASC,
  isCumulative = false,
  gapFillingDateRange,
}: {
  stages: string[];
  groupMode: BarChartGroupMode;
  primaryAxisOrderBy?: GraphOrderBy;
  isCumulative?: boolean;
  gapFillingDateRange: DateRangeBounds;
}) => {
  const { data, indexBy, formattedToRawLookup, hasTooManyGroups } =
    transformToTwoDimensionalBarChartData({
      filteredRawResults: buildRawResults(stages),
      primaryAxisGroupByField: CLOSE_DATE_FIELD,
      secondaryAxisGroupByField: STAGE_FIELD,
      aggregateField: AMOUNT_FIELD,
      configuration: Object.assign(new BarChartConfigurationDTO(), {
        configurationType: WidgetConfigurationType.BAR_CHART,
        aggregateFieldMetadataId: AMOUNT_FIELD.id,
        aggregateOperation: AggregateOperations.SUM,
        primaryAxisGroupByFieldMetadataId: CLOSE_DATE_FIELD.id,
        primaryAxisDateGranularity: ObjectRecordGroupByDateGranularity.DAY,
        primaryAxisOrderBy,
        secondaryAxisGroupByFieldMetadataId: STAGE_FIELD.id,
        layout: BarChartLayout.VERTICAL,
        groupMode,
        isCumulative,
      }),
      userTimezone: 'UTC',
      firstDayOfTheWeek: CalendarStartDay.MONDAY,
      gapFillingDateRange,
      primaryRelationLabelResolution: undefined,
      secondaryRelationLabelResolution: undefined,
      i18n: setupI18n({ locale: 'en', messages: { en: {} } }),
    });

  return {
    days: data.map((row) => formattedToRawLookup[String(row[indexBy])]),
    rows: data,
    hasTooManyGroups,
  };
};

const daysBetween = (start: string, end: string) => {
  const days: string[] = [];

  for (
    let day = Temporal.PlainDate.from(start);
    Temporal.PlainDate.compare(day, Temporal.PlainDate.from(end)) <= 0;
    day = day.add({ days: 1 })
  ) {
    days.push(day.toString());
  }

  return days;
};

const FIVE_STAGES = ['A', 'B', 'C', 'D', 'E'];

describe('transformToTwoDimensionalBarChartData with a dashboard range', () => {
  it.each([
    ['ascending, extended backwards', GraphOrderBy.FIELD_ASC, PAST_30_DAYS],
    ['descending, extended forwards', GraphOrderBy.FIELD_DESC, THIS_MONTH],
  ])(
    'should keep every data bucket of a grouped chart whose extended axis would exceed the bar cap (%s)',
    (_title, primaryAxisOrderBy, gapFillingDateRange) => {
      const { days, hasTooManyGroups } = transformDays({
        stages: FIVE_STAGES,
        groupMode: BarChartGroupMode.GROUPED,
        primaryAxisOrderBy,
        gapFillingDateRange,
      });

      expect(days).toEqual(
        primaryAxisOrderBy === GraphOrderBy.FIELD_ASC
          ? DATA_DAYS
          : [...DATA_DAYS].reverse(),
      );
      expect(hasTooManyGroups).toBe(false);
    },
  );

  it('should extend a grouped chart whose extended axis fits the bar cap', () => {
    expect(
      transformDays({
        stages: ['A', 'B'],
        groupMode: BarChartGroupMode.GROUPED,
        gapFillingDateRange: PAST_30_DAYS,
      }).days,
    ).toEqual(daysBetween('2026-10-12', '2026-11-10'));
  });

  it.each([
    [
      'ascending',
      GraphOrderBy.FIELD_ASC,
      PAST_30_DAYS,
      daysBetween('2026-10-12', '2026-11-10'),
    ],
    [
      'descending',
      GraphOrderBy.FIELD_DESC,
      THIS_MONTH,
      daysBetween('2026-11-01', '2026-11-30').reverse(),
    ],
  ])(
    'should extend a stacked chart and keep its data buckets (%s)',
    (_title, primaryAxisOrderBy, gapFillingDateRange, expectedDays) => {
      const { days, hasTooManyGroups } = transformDays({
        stages: FIVE_STAGES,
        groupMode: BarChartGroupMode.STACKED,
        primaryAxisOrderBy,
        gapFillingDateRange,
      });

      expect(days).toEqual(expectedDays);
      expect(days).toEqual(expect.arrayContaining(DATA_DAYS));
      expect(hasTooManyGroups).toBe(false);
    },
  );

  it('should accumulate from zero across the leading empty buckets', () => {
    const { rows } = transformDays({
      stages: ['A'],
      groupMode: BarChartGroupMode.STACKED,
      isCumulative: true,
      gapFillingDateRange: PAST_30_DAYS,
    });

    expect(rows.map((row) => row.A)).toEqual([
      ...Array.from({ length: 20 }, () => 0),
      ...Array.from({ length: 10 }, (_, index) => index + 1),
    ]);
  });
});
