import { type RatioAggregateConfig } from '@/types';
import { isDefined } from '@/utils/validation/isDefined';

type ChartFieldMetadataReferences = {
  configurationType: string;
  aggregateFieldMetadataId?: string | null;
  groupByFieldMetadataId?: string | null;
  primaryAxisGroupByFieldMetadataId?: string | null;
  secondaryAxisGroupByFieldMetadataId?: string | null;
  ratioAggregateConfig?: Pick<RatioAggregateConfig, 'fieldMetadataId'> | null;
};

export const getChartReferencedFieldMetadataIds = ({
  aggregateFieldMetadataId,
  groupByFieldMetadataId,
  primaryAxisGroupByFieldMetadataId,
  secondaryAxisGroupByFieldMetadataId,
  ratioAggregateConfig,
}: ChartFieldMetadataReferences): string[] =>
  [
    aggregateFieldMetadataId,
    groupByFieldMetadataId,
    primaryAxisGroupByFieldMetadataId,
    secondaryAxisGroupByFieldMetadataId,
    ratioAggregateConfig?.fieldMetadataId,
  ].filter(isDefined);
