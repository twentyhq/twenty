import {
  RecordFilterOperand,
  RowLevelPermissionPredicateOperand,
} from '@/types';
import { assertUnreachable } from '@/utils/assertUnreachable';

export const mapRLSOperandToRecordFilterOperand = (
  operand: RowLevelPermissionPredicateOperand,
): RecordFilterOperand => {
  switch (operand) {
    case RowLevelPermissionPredicateOperand.IS:
      return RecordFilterOperand.IS;
    case RowLevelPermissionPredicateOperand.IS_NOT_NULL:
      return RecordFilterOperand.IS_NOT_NULL;
    case RowLevelPermissionPredicateOperand.IS_NOT:
      return RecordFilterOperand.IS_NOT;
    case RowLevelPermissionPredicateOperand.LESS_THAN_OR_EQUAL:
      return RecordFilterOperand.LESS_THAN_OR_EQUAL;
    case RowLevelPermissionPredicateOperand.GREATER_THAN_OR_EQUAL:
      return RecordFilterOperand.GREATER_THAN_OR_EQUAL;
    case RowLevelPermissionPredicateOperand.IS_BEFORE:
      return RecordFilterOperand.IS_BEFORE;
    case RowLevelPermissionPredicateOperand.IS_AFTER:
      return RecordFilterOperand.IS_AFTER;
    case RowLevelPermissionPredicateOperand.CONTAINS:
      return RecordFilterOperand.CONTAINS;
    case RowLevelPermissionPredicateOperand.DOES_NOT_CONTAIN:
      return RecordFilterOperand.DOES_NOT_CONTAIN;
    case RowLevelPermissionPredicateOperand.IS_EMPTY:
      return RecordFilterOperand.IS_EMPTY;
    case RowLevelPermissionPredicateOperand.IS_NOT_EMPTY:
      return RecordFilterOperand.IS_NOT_EMPTY;
    case RowLevelPermissionPredicateOperand.IS_RELATIVE:
      return RecordFilterOperand.IS_RELATIVE;
    case RowLevelPermissionPredicateOperand.IS_IN_PAST:
      return RecordFilterOperand.IS_IN_PAST;
    case RowLevelPermissionPredicateOperand.IS_IN_FUTURE:
      return RecordFilterOperand.IS_IN_FUTURE;
    case RowLevelPermissionPredicateOperand.IS_TODAY:
      return RecordFilterOperand.IS_TODAY;
    case RowLevelPermissionPredicateOperand.VECTOR_SEARCH:
      return RecordFilterOperand.VECTOR_SEARCH;
    default:
      return assertUnreachable(operand);
  }
};
