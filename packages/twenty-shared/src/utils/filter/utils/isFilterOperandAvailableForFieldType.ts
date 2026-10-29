import { type FieldMetadataType, type ViewFilterOperand } from '@/types';

import { getFilterOperandsForFilterableFieldType } from './getFilterOperandsForFilterableFieldType';
import { getFilterTypeFromFieldType } from './getFilterTypeFromFieldType';

export const isFilterOperandAvailableForFieldType = ({
  fieldType,
  operand,
  subFieldName,
}: {
  fieldType: FieldMetadataType;
  operand: ViewFilterOperand;
  subFieldName?: string | null;
}): boolean =>
  getFilterOperandsForFilterableFieldType({
    filterType: getFilterTypeFromFieldType(fieldType),
    subFieldName,
  }).includes(operand);
