import { CONDITIONAL_AVAILABILITY_FAVORITE_RECORD_IDS_VARIABLE_NAME } from '@/constants/internal/ConditionalAvailabilityFavoriteRecordIdsVariableName';
import { type ConditionalAvailabilityCompiledItem } from '@/types/conditional-display/internal/ConditionalAvailabilityCompiledItem';
import { isDefined } from '@/utils/validation/isDefined';

export const describeConditionalAvailabilityCompiledItem = (
  compiledItem: ConditionalAvailabilityCompiledItem,
): string => {
  switch (compiledItem.kind) {
    case 'reference':
      return isDefined(compiledItem.subFieldName)
        ? `member "${compiledItem.name}.${compiledItem.subFieldName}"`
        : `variable "${compiledItem.name}"`;
    case 'literal':
      return `literal ${JSON.stringify(compiledItem.value)}`;
    case 'list':
      return `list ${JSON.stringify(compiledItem.values)}`;
    case 'favoriteRecordCount':
      return `${CONDITIONAL_AVAILABILITY_FAVORITE_RECORD_IDS_VARIABLE_NAME}.length`;
    case 'recordFilter':
    case 'recordFilterGroup':
      return 'condition';
  }
};
