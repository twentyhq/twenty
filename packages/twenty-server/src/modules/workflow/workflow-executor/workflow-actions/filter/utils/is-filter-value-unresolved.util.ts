import { ViewFilterOperand } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const isFilterValueUnresolved = ({
  rightOperand,
  operand,
}: {
  rightOperand: unknown;
  operand: ViewFilterOperand;
}): boolean => {
  return (
    !isDefined(rightOperand) &&
    operand !== ViewFilterOperand.IS_EMPTY &&
    operand !== ViewFilterOperand.IS_NOT_EMPTY
  );
};
