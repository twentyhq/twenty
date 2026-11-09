import { ViewFilterOperand } from '@/types';
import { isDefined } from '@/utils/validation/isDefined';

// "Is empty" keeps no date to filter on, so it must not choose the field
export const getDashboardFilterCandidateFieldMetadataIds = ({
  primaryAxisGroupByFieldMetadataId,
  groupByFieldMetadataId,
  filter,
}: {
  primaryAxisGroupByFieldMetadataId?: string | null;
  groupByFieldMetadataId?: string | null;
  filter?: {
    recordFilters?: { fieldMetadataId: string; operand: string }[];
  } | null;
}): {
  groupByFieldMetadataIds: string[];
  widgetFilterFieldMetadataIds: string[];
} => ({
  groupByFieldMetadataIds: [
    primaryAxisGroupByFieldMetadataId,
    groupByFieldMetadataId,
  ].filter(isDefined),
  widgetFilterFieldMetadataIds: (filter?.recordFilters ?? [])
    .filter(({ operand }) => operand !== ViewFilterOperand.IS_EMPTY)
    .map(({ fieldMetadataId }) => fieldMetadataId),
});
