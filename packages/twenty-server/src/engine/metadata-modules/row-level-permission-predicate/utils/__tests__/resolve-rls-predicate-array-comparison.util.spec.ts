import {
  FieldMetadataType,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';

import { resolveRlsPredicateArrayComparison } from 'src/engine/metadata-modules/row-level-permission-predicate/utils/resolve-rls-predicate-array-comparison.util';

describe('resolveRlsPredicateArrayComparison', () => {
  it.each([
    [
      FieldMetadataType.SELECT,
      RowLevelPermissionPredicateOperand.IS,
      'ARRAY_AS_A_WHOLE',
    ],
    [
      FieldMetadataType.RELATION,
      RowLevelPermissionPredicateOperand.IS_NOT,
      'ARRAY_AS_A_WHOLE',
    ],
    [
      FieldMetadataType.TEXT,
      RowLevelPermissionPredicateOperand.IS,
      'UNION_OF_VALUES',
    ],
    [
      FieldMetadataType.TEXT,
      RowLevelPermissionPredicateOperand.CONTAINS,
      'UNION_OF_VALUES',
    ],
    [
      FieldMetadataType.NUMBER,
      RowLevelPermissionPredicateOperand.IS_NOT,
      'INTERSECTION_OF_VALUES',
    ],
    [
      FieldMetadataType.TEXT,
      RowLevelPermissionPredicateOperand.DOES_NOT_CONTAIN,
      'INTERSECTION_OF_VALUES',
    ],
    [
      FieldMetadataType.NUMBER,
      RowLevelPermissionPredicateOperand.GREATER_THAN_OR_EQUAL,
      'OPERAND_NOT_COMPARABLE',
    ],
    [
      FieldMetadataType.BOOLEAN,
      RowLevelPermissionPredicateOperand.IS,
      'FIELD_TYPE_NOT_COMPARABLE',
    ],
    [
      FieldMetadataType.DATE_TIME,
      RowLevelPermissionPredicateOperand.IS,
      'FIELD_TYPE_NOT_COMPARABLE',
    ],
  ])(
    'should compare a %s field with %s as %s',
    (fieldType, operand, expected) => {
      expect(resolveRlsPredicateArrayComparison({ fieldType, operand })).toBe(
        expected,
      );
    },
  );
});
