/* @license Enterprise */

import { assertUnreachable } from 'twenty-shared/utils';

import { type RowAccessExpression } from 'src/engine/twenty-orm/types/row-access-policy.type';

// Parent policies are left out: writes check parents on their own through
// validateInheritedParentsAreWritableOrThrow
export const isRowAccessExpressionReadingRoleFilter = (
  expression: RowAccessExpression,
): boolean => {
  switch (expression.kind) {
    case 'and':
    case 'or':
      return expression.operands.some(isRowAccessExpressionReadingRoleFilter);
    case 'roleFilter':
      return true;
    case 'recordShared':
    case 'namedGrant':
    case 'recordNotRestricted':
    case 'inheritedReadability':
      return false;
    default:
      return assertUnreachable(expression);
  }
};
