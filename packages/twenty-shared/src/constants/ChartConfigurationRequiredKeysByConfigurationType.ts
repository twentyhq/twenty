import {
  type AggregateChartConfiguration,
  type BarChartConfiguration,
  type GraphWidgetConfigurationType,
  type LineChartConfiguration,
  type PieChartConfiguration,
} from '@/types';

type RequiredKeysOf<TConfiguration> = {
  [TKey in keyof TConfiguration]-?: undefined extends TConfiguration[TKey]
    ? never
    : TKey;
}[keyof TConfiguration];

export const CHART_CONFIGURATION_REQUIRED_KEYS_BY_CONFIGURATION_TYPE = {
  AGGREGATE_CHART: {
    configurationType: true,
    aggregateFieldMetadataId: true,
    aggregateOperation: true,
  } satisfies Record<RequiredKeysOf<AggregateChartConfiguration>, true>,
  PIE_CHART: {
    configurationType: true,
    aggregateFieldMetadataId: true,
    aggregateOperation: true,
    groupByFieldMetadataId: true,
  } satisfies Record<RequiredKeysOf<PieChartConfiguration>, true>,
  BAR_CHART: {
    configurationType: true,
    aggregateFieldMetadataId: true,
    aggregateOperation: true,
    primaryAxisGroupByFieldMetadataId: true,
  } satisfies Record<RequiredKeysOf<BarChartConfiguration>, true>,
  LINE_CHART: {
    configurationType: true,
    aggregateFieldMetadataId: true,
    aggregateOperation: true,
    primaryAxisGroupByFieldMetadataId: true,
  } satisfies Record<RequiredKeysOf<LineChartConfiguration>, true>,
} as const satisfies Record<GraphWidgetConfigurationType, Record<string, true>>;
