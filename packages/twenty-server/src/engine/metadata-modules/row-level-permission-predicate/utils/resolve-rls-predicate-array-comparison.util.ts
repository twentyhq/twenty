import {
  type FieldMetadataType,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { getFilterTypeFromFieldType } from 'twenty-shared/utils';

export type RlsPredicateArrayComparison =
  | 'ARRAY_AS_A_WHOLE'
  | 'UNION_OF_VALUES'
  | 'INTERSECTION_OF_VALUES'
  | 'FIELD_TYPE_NOT_COMPARABLE'
  | 'OPERAND_NOT_COMPARABLE';

export const resolveRlsPredicateArrayComparison = ({
  fieldType,
  operand,
}: {
  fieldType: FieldMetadataType;
  operand: RowLevelPermissionPredicateOperand;
}): RlsPredicateArrayComparison => {
  switch (getFilterTypeFromFieldType(fieldType)) {
    case 'SELECT':
    case 'MULTI_SELECT':
    case 'RELATION':
    case 'UUID':
      return 'ARRAY_AS_A_WHOLE';
    case 'TEXT':
    case 'NUMBER':
      break;
    default:
      return 'FIELD_TYPE_NOT_COMPARABLE';
  }

  switch (operand) {
    case RowLevelPermissionPredicateOperand.IS:
    case RowLevelPermissionPredicateOperand.CONTAINS:
      return 'UNION_OF_VALUES';
    case RowLevelPermissionPredicateOperand.IS_NOT:
    case RowLevelPermissionPredicateOperand.DOES_NOT_CONTAIN:
      return 'INTERSECTION_OF_VALUES';
    default:
      return 'OPERAND_NOT_COMPARABLE';
  }
};
