import {
  isArray,
  isBoolean,
  isNonEmptyArray,
  isNumber,
  isString,
} from '@sniptt/guards';
import {
  type ConditionalAvailabilityLogicalOperator,
  type ConditionalAvailabilityNode,
} from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

type JsonLogicLiteral = string | number | boolean;

const FIRST_SELECTED_RECORD_VARIABLE_PREFIX = 'selectedRecords.0.';

const isJsonLogicLiteral = (value: unknown): value is JsonLogicLiteral =>
  isString(value) || isNumber(value) || isBoolean(value);

const getVariableName = (operand: unknown): string | undefined =>
  isPlainObject(operand) &&
  Object.keys(operand).length === 1 &&
  isString(operand.var)
    ? operand.var
    : undefined;

const getFirstSelectedRecordPropertyPath = (
  operand: unknown,
): string | undefined => {
  const variableName = getVariableName(operand);

  return isDefined(variableName) &&
    variableName.startsWith(FIRST_SELECTED_RECORD_VARIABLE_PREFIX) &&
    variableName.length > FIRST_SELECTED_RECORD_VARIABLE_PREFIX.length
    ? variableName.slice(FIRST_SELECTED_RECORD_VARIABLE_PREFIX.length)
    : undefined;
};

const toOperandNode = (
  operand: unknown,
): ConditionalAvailabilityNode | undefined => {
  if (isJsonLogicLiteral(operand)) {
    return { type: 'LITERAL', value: operand };
  }

  return getVariableName(operand) === 'device'
    ? { type: 'PATH', path: 'device' }
    : undefined;
};

const toSelectedRecordsCall = ({
  functionName,
  propertyPath,
  value,
}: {
  functionName: 'includesSome' | 'everyEquals' | 'noneEquals';
  propertyPath: string;
  value: JsonLogicLiteral;
}): ConditionalAvailabilityNode => ({
  type: 'CALL',
  functionName,
  arguments: [
    { type: 'PATH', path: 'selectedRecords' },
    { type: 'LITERAL', value: propertyPath },
    { type: 'LITERAL', value },
  ],
});

const toEqualityNode = ({
  isNegated,
  firstOperand,
  secondOperand,
}: {
  isNegated: boolean;
  firstOperand: unknown;
  secondOperand: unknown;
}): ConditionalAvailabilityNode | undefined => {
  const propertyPath = getFirstSelectedRecordPropertyPath(firstOperand);

  if (isDefined(propertyPath)) {
    return isJsonLogicLiteral(secondOperand)
      ? toSelectedRecordsCall({
          functionName: isNegated ? 'noneEquals' : 'everyEquals',
          propertyPath,
          value: secondOperand,
        })
      : undefined;
  }

  const left = toOperandNode(firstOperand);
  const right = toOperandNode(secondOperand);

  if (!isDefined(left) || !isDefined(right)) {
    return undefined;
  }

  return {
    type: 'COMPARISON',
    operator: isNegated ? 'NOT_EQUAL' : 'EQUAL',
    left,
    right,
  };
};

const toComparisonNode = ({
  operator,
  operands,
}: {
  operator: string;
  operands: unknown;
}): ConditionalAvailabilityNode | undefined => {
  if (!isArray(operands) || operands.length !== 2) {
    return undefined;
  }

  const [firstOperand, secondOperand] = operands;

  switch (operator) {
    case 'in': {
      const propertyPath = getFirstSelectedRecordPropertyPath(secondOperand);

      return isDefined(propertyPath) && isJsonLogicLiteral(firstOperand)
        ? toSelectedRecordsCall({
            functionName: 'includesSome',
            propertyPath,
            value: firstOperand,
          })
        : undefined;
    }
    case '==':
    case '===':
      return toEqualityNode({ isNegated: false, firstOperand, secondOperand });
    case '!=':
    case '!==':
      return toEqualityNode({ isNegated: true, firstOperand, secondOperand });
    default:
      return undefined;
  }
};

const toGroupNode = ({
  logicalOperator,
  children,
}: {
  logicalOperator: ConditionalAvailabilityLogicalOperator;
  children: ConditionalAvailabilityNode[];
}): ConditionalAvailabilityNode => {
  const [onlyChild] = children;

  if (children.length === 1 && isDefined(onlyChild)) {
    return onlyChild;
  }

  return {
    type: 'GROUP',
    logicalOperator,
    children: children.flatMap((child) =>
      child.type === 'GROUP' && child.logicalOperator === logicalOperator
        ? child.children
        : [child],
    ),
  };
};

export const fromPageLayoutWidgetJsonLogicToConditionalAvailability = (
  jsonLogic: unknown,
): ConditionalAvailabilityNode | undefined => {
  const entries = isPlainObject(jsonLogic) ? Object.entries(jsonLogic) : [];

  if (entries.length !== 1) {
    return undefined;
  }

  const [[operator, operands]] = entries;

  if (operator === 'and' || operator === 'or') {
    if (!isNonEmptyArray(operands)) {
      return undefined;
    }

    const children = operands.map((operand) =>
      fromPageLayoutWidgetJsonLogicToConditionalAvailability(operand),
    );

    return children.every(isDefined)
      ? toGroupNode({
          logicalOperator: operator === 'and' ? 'AND' : 'OR',
          children,
        })
      : undefined;
  }

  if (operator === '!') {
    const negatedOperands = isArray(operands) ? operands : [operands];
    const child =
      negatedOperands.length === 1
        ? fromPageLayoutWidgetJsonLogicToConditionalAvailability(
            negatedOperands[0],
          )
        : undefined;

    return isDefined(child) ? { type: 'NOT', child } : undefined;
  }

  return toComparisonNode({ operator, operands });
};
