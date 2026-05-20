import {
  type FilterableAndTSVectorFieldType,
  type ViewFilterOperand,
} from '@/types';
import { isDefined } from '@/utils/validation/isDefined';

import { COMPOSITE_FIELD_FILTER_OPERANDS_MAP } from './compositeFieldFilterOperandsMap';
import { FILTER_OPERANDS_MAP } from './filterOperandsMap';

export const getFilterOperandsForFilterableFieldType = ({
  filterType,
  subFieldName,
}: {
  filterType: FilterableAndTSVectorFieldType;
  subFieldName?: string | null | undefined;
}): readonly ViewFilterOperand[] => {
  if (filterType === 'CURRENCY' && isDefined(subFieldName)) {
    if (subFieldName === 'currencyCode') {
      return COMPOSITE_FIELD_FILTER_OPERANDS_MAP.CURRENCY.currencyCode;
    }

    return COMPOSITE_FIELD_FILTER_OPERANDS_MAP.CURRENCY.amountMicros;
  }

  return FILTER_OPERANDS_MAP[filterType];
};
