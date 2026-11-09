import { type ChartFilter } from '@/types';
import { isDefined } from '@/utils/validation/isDefined';

export const getDashboardFilterCandidateFieldMetadataIds = ({
  primaryAxisGroupByFieldMetadataId,
  groupByFieldMetadataId,
  filter,
}: {
  primaryAxisGroupByFieldMetadataId?: string | null;
  groupByFieldMetadataId?: string | null;
  filter?: ChartFilter | null;
}): {
  groupByFieldMetadataIds: string[];
  widgetFilterFieldMetadataIds: string[];
} => ({
  groupByFieldMetadataIds: [
    primaryAxisGroupByFieldMetadataId,
    groupByFieldMetadataId,
  ].filter(isDefined),
  widgetFilterFieldMetadataIds: (filter?.recordFilters ?? []).map(
    ({ fieldMetadataId }) => fieldMetadataId,
  ),
});
