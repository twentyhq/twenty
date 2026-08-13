import { CalendarStartDay } from 'twenty-shared/constants';
import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type PieChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/pie-chart-configuration.dto';
import { GraphOrderBy } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-order-by.enum';
import { PIE_CHART_MAXIMUM_NUMBER_OF_SLICES } from 'src/modules/dashboard/chart-data/constants/pie-chart-maximum-number-of-slices.constant';
import { transformToPieChartData } from 'src/modules/dashboard/chart-data/utils/transform-to-pie-chart-data.util';

const groupByField = {
  type: FieldMetadataType.TEXT,
  name: 'stage',
} as FlatFieldMetadata;

const buildConfiguration = (
  configuration: Partial<PieChartConfigurationDTO> = {},
): PieChartConfigurationDTO => configuration as PieChartConfigurationDTO;

const transform = ({
  filteredRawResults,
  configuration = buildConfiguration(),
}: {
  filteredRawResults: Array<{
    groupByDimensionValues: unknown[];
    aggregateValue: number;
  }>;
  configuration?: PieChartConfigurationDTO;
}) =>
  transformToPieChartData({
    filteredRawResults,
    groupByField,
    configuration,
    userTimezone: 'UTC',
    firstDayOfTheWeek: CalendarStartDay.SUNDAY,
    relationLabelResolution: undefined,
  });

const buildResults = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    groupByDimensionValues: [`slice-${index}`],
    aggregateValue: count - index,
  }));

describe('transformToPieChartData', () => {
  it('should map each raw result to a key/value slice', () => {
    const result = transform({
      filteredRawResults: [
        { groupByDimensionValues: ['won'], aggregateValue: 3 },
        { groupByDimensionValues: ['lost'], aggregateValue: 1 },
      ],
    });

    expect(result.data).toEqual([
      { key: 'won', value: 3 },
      { key: 'lost', value: 1 },
    ]);
  });

  it('should not expose rawValue on the returned slices', () => {
    const result = transform({
      filteredRawResults: [
        { groupByDimensionValues: ['won'], aggregateValue: 3 },
      ],
    });

    expect(result.data[0]).not.toHaveProperty('rawValue');
  });

  it('should default the display flags when the configuration omits them', () => {
    const result = transform({
      filteredRawResults: [
        { groupByDimensionValues: ['won'], aggregateValue: 1 },
      ],
    });

    expect(result.showLegend).toBe(true);
    expect(result.showDataLabels).toBe(false);
    expect(result.showCenterMetric).toBe(true);
  });

  it('should honour explicit display flags', () => {
    const result = transform({
      filteredRawResults: [
        { groupByDimensionValues: ['won'], aggregateValue: 1 },
      ],
      configuration: buildConfiguration({
        displayLegend: false,
        displayDataLabel: true,
        showCenterMetric: false,
      }),
    });

    expect(result.showLegend).toBe(false);
    expect(result.showDataLabels).toBe(true);
    expect(result.showCenterMetric).toBe(false);
  });

  it('should not flag too many groups when at the slice limit', () => {
    const result = transform({
      filteredRawResults: buildResults(PIE_CHART_MAXIMUM_NUMBER_OF_SLICES),
    });

    expect(result.hasTooManyGroups).toBe(false);
    expect(result.data).toHaveLength(PIE_CHART_MAXIMUM_NUMBER_OF_SLICES);
  });

  it('should cap the slices and flag too many groups beyond the limit', () => {
    const result = transform({
      filteredRawResults: buildResults(PIE_CHART_MAXIMUM_NUMBER_OF_SLICES + 5),
    });

    expect(result.hasTooManyGroups).toBe(true);
    expect(result.data).toHaveLength(PIE_CHART_MAXIMUM_NUMBER_OF_SLICES);
  });

  it('should sort slices by value descending when configured', () => {
    const result = transform({
      filteredRawResults: [
        { groupByDimensionValues: ['small'], aggregateValue: 1 },
        { groupByDimensionValues: ['large'], aggregateValue: 9 },
        { groupByDimensionValues: ['medium'], aggregateValue: 5 },
      ],
      configuration: buildConfiguration({
        orderBy: GraphOrderBy.VALUE_DESC,
      }),
    });

    expect(result.data.map(({ key }) => key)).toEqual([
      'large',
      'medium',
      'small',
    ]);
  });

  it('should return an empty dataset for no raw results', () => {
    const result = transform({ filteredRawResults: [] });

    expect(result.data).toEqual([]);
    expect(result.hasTooManyGroups).toBe(false);
  });
});
