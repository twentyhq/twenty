import {
  type FieldMetadataType,
  type RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { getFilterTypeFromFieldType } from 'twenty-shared/utils';

import { RLS_PREDICATE_ARRAY_MATCHING_INTERSECTION_OPERANDS } from 'src/engine/metadata-modules/row-level-permission-predicate/constants/rls-predicate-array-matching-intersection-operands.constant';
import { RLS_PREDICATE_ARRAY_MATCHING_UNION_OPERANDS } from 'src/engine/metadata-modules/row-level-permission-predicate/constants/rls-predicate-array-matching-union-operands.constant';
import { RLS_PREDICATE_ARRAY_VALUE_FILTER_TYPES } from 'src/engine/metadata-modules/row-level-permission-predicate/constants/rls-predicate-array-value-filter-types.constant';
import { RLS_PREDICATE_SINGLE_VALUE_FILTER_TYPES_COMPARABLE_TO_ARRAY } from 'src/engine/metadata-modules/row-level-permission-predicate/constants/rls-predicate-single-value-filter-types-comparable-to-array.constant';

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
  const filterType = getFilterTypeFromFieldType(fieldType);

  if (RLS_PREDICATE_ARRAY_VALUE_FILTER_TYPES.includes(filterType)) {
    return 'ARRAY_AS_A_WHOLE';
  }

  if (
    !RLS_PREDICATE_SINGLE_VALUE_FILTER_TYPES_COMPARABLE_TO_ARRAY.includes(
      filterType,
    )
  ) {
    return 'FIELD_TYPE_NOT_COMPARABLE';
  }

  if (RLS_PREDICATE_ARRAY_MATCHING_UNION_OPERANDS.includes(operand)) {
    return 'UNION_OF_VALUES';
  }

  return RLS_PREDICATE_ARRAY_MATCHING_INTERSECTION_OPERANDS.includes(operand)
    ? 'INTERSECTION_OF_VALUES'
    : 'OPERAND_NOT_COMPARABLE';
};
