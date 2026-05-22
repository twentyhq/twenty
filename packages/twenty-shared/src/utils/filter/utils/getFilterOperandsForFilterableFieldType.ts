import {
  type FilterableAndTSVectorFieldType,
  ViewFilterOperand,
} from '@/types';

import { COMPOSITE_FIELD_FILTER_OPERANDS_MAP } from './compositeFieldFilterOperandsMap';
import { FILTER_OPERANDS_MAP } from './filterOperandsMap';

const actorSubFieldOperands = [
  ViewFilterOperand.IS,
  ViewFilterOperand.IS_NOT,
  ViewFilterOperand.IS_EMPTY,
  ViewFilterOperand.IS_NOT_EMPTY,
] as const;

export const getFilterOperandsForFilterableFieldType = ({
  filterType,
  subFieldName,
}: {
  filterType: FilterableAndTSVectorFieldType;
  subFieldName?: string | null | undefined;
}): readonly ViewFilterOperand[] => {
  if (filterType === 'CURRENCY') {
    if (subFieldName === 'currencyCode') {
      return COMPOSITE_FIELD_FILTER_OPERANDS_MAP.CURRENCY.currencyCode;
    }

    return COMPOSITE_FIELD_FILTER_OPERANDS_MAP.CURRENCY.amountMicros;
  }

  if (
    filterType === 'ACTOR' &&
    (subFieldName === 'source' || subFieldName === 'workspaceMemberId')
  ) {
    return actorSubFieldOperands;
  }

  return FILTER_OPERANDS_MAP[filterType];
};
