/* @license Enterprise */

import { assertUnreachable } from 'twenty-shared/utils';

import { type RowAccessExpression } from 'src/engine/twenty-orm/types/row-access-policy.type';

// Shares are keyed by id and parents are checked on their own, so only these
// nodes can change their answer when a record's values change
export const isRowAccessExpressionReadingRecordValues = (
  expression: RowAccessExpression,
): boolean => {
  switch (expression.kind) {
    case 'and':
    case 'or':
      return expression.operands.some(isRowAccessExpressionReadingRecordValues);
    case 'roleFilter':
    case 'sharingRule':
      return true;
    case 'recordShared':
    case 'recordNotRestricted':
    case 'inheritedReadability':
      return false;
    default:
      return assertUnreachable(expression);
  }
};
