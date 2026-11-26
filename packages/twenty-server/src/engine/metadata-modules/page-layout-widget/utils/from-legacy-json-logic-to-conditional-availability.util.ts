import {
  isArray,
  isBoolean,
  isNonEmptyArray,
  isNumber,
  isString,
} from '@sniptt/guards';
import {
  type ConditionalEvaluationNode,
  joinConditionalEvaluationNodes,
} from 'twenty-shared/conditional-evaluation';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

type JsonLogicLiteral = string | number | boolean;

const FIRST_SELECTED_RECORD_VARIABLE_PREFIX = 'selectedRecords.0.';

const FEATURE_FLAG_VARIABLE_PREFIX = 'featureFlags.';

const isJsonLogicLiteral = (value: unknown): value is JsonLogicLiteral =>
  isString(value) || isNumber(value) || isBoolean(value);

const getVariablePath = (operand: unknown): string | undefined =>
  isPlainObject(operand) &&
  Object.keys(operand).length === 1 &&
  isString(operand.var)
    ? operand.var
    : undefined;

const getFirstSelectedRecordPropertyPath = (
  operand: unknown,
): string | undefined => {
  const variablePath = getVariablePath(operand);

  return isDefined(variablePath) &&
    variablePath.startsWith(FIRST_SELECTED_RECORD_VARIABLE_PREFIX) &&
    variablePath.length > FIRST_SELECTED_RECORD_VARIABLE_PREFIX.length
    ? variablePath.slice(FIRST_SELECTED_RECORD_VARIABLE_PREFIX.length)
    : undefined;
};

const getFeatureFlagVariablePath = (operand: unknown): string | undefined => {
  const variablePath = getVariablePath(operand);

  return isDefined(variablePath) &&
    variablePath.startsWith(FEATURE_FLAG_VARIABLE_PREFIX) &&
    variablePath.length > FEATURE_FLAG_VARIABLE_PREFIX.length
    ? variablePath
    : undefined;
};

// A widget sits on one record, so a check on the first selected record is a check on every selected record
const toSelectedRecordsCall = ({
  functionName,
  propertyPath,
  value,
}: {
  functionName: 'every' | 'everyEquals' | 'includesSome';
  propertyPath: string;
  value?: JsonLogicLiteral;
}): ConditionalEvaluationNode => {
  const propertyArguments: ConditionalEvaluationNode[] = [
    { type: 'VARIABLE', path: 'selectedRecords' },
    { type: 'LITERAL', value: propertyPath },
  ];

  return {
    type: 'FUNCTION_CALL',
    functionName,
    arguments: isDefined(value)
      ? [...propertyArguments, { type: 'LITERAL', value }]
      : propertyArguments,
  };
};

const toOperandNode = (
  operand: unknown,
): ConditionalEvaluationNode | undefined => {
  if (isJsonLogicLiteral(operand)) {
    return { type: 'LITERAL', value: operand };
  }

  const variablePath =
    getVariablePath(operand) === 'device'
      ? 'device'
      : getFeatureFlagVariablePath(operand);

  return isDefined(variablePath)
    ? { type: 'VARIABLE', path: variablePath }
    : undefined;
};

// json-logic "==" converts types before comparing while the tree does not, so a loose comparison is only read where both give the same answer
const isSameUnderLooseAndStrictEquality = ({
  firstOperand,
  secondOperand,
}: {
  firstOperand: unknown;
  secondOperand: unknown;
}): boolean => {
  if (isJsonLogicLiteral(firstOperand) && isJsonLogicLiteral(secondOperand)) {
    return typeof firstOperand === typeof secondOperand;
  }

  return [firstOperand, secondOperand]
    .filter(isJsonLogicLiteral)
    .every((literal) => isString(literal) && Number.isNaN(Number(literal)));
};

const toEqualityNode = ({
  isStrict,
  firstOperand,
  secondOperand,
}: {
  isStrict: boolean;
  firstOperand: unknown;
  secondOperand: unknown;
}): ConditionalEvaluationNode | undefined => {
  if (
    !isStrict &&
    !isSameUnderLooseAndStrictEquality({ firstOperand, secondOperand })
  ) {
    return undefined;
  }

  const [propertyOperand, valueOperand] = isDefined(
    getFirstSelectedRecordPropertyPath(secondOperand),
  )
    ? [secondOperand, firstOperand]
    : [firstOperand, secondOperand];

  const propertyPath = getFirstSelectedRecordPropertyPath(propertyOperand);

  if (isDefined(propertyPath)) {
    return isJsonLogicLiteral(valueOperand)
      ? toSelectedRecordsCall({
          functionName: 'everyEquals',
          propertyPath,
          value: valueOperand,
        })
      : undefined;
  }

  const left = toOperandNode(firstOperand);
  const right = toOperandNode(secondOperand);

  return isDefined(left) && isDefined(right)
    ? { type: 'COMPARISON', operator: 'EQUAL', left, right }
    : undefined;
};

const toMembershipNode = ({
  firstOperand,
  secondOperand,
}: {
  firstOperand: unknown;
  secondOperand: unknown;
}): ConditionalEvaluationNode | undefined => {
  const containerPropertyPath =
    getFirstSelectedRecordPropertyPath(secondOperand);

  if (isDefined(containerPropertyPath)) {
    return isJsonLogicLiteral(firstOperand)
      ? toSelectedRecordsCall({
          functionName: 'includesSome',
          propertyPath: containerPropertyPath,
          value: firstOperand,
        })
      : undefined;
  }

  const memberPropertyPath = getFirstSelectedRecordPropertyPath(firstOperand);

  if (
    !isDefined(memberPropertyPath) ||
    !isNonEmptyArray(secondOperand) ||
    !secondOperand.every(isJsonLogicLiteral)
  ) {
    return undefined;
  }

  return joinConditionalEvaluationNodes({
    logicalOperator: 'OR',
    nodes: secondOperand.map((value) =>
      toSelectedRecordsCall({
        functionName: 'everyEquals',
        propertyPath: memberPropertyPath,
        value,
      }),
    ),
  });
};

const toVariableTruthinessNode = (
  operand: unknown,
): ConditionalEvaluationNode | undefined => {
  const propertyPath = getFirstSelectedRecordPropertyPath(operand);

  if (isDefined(propertyPath)) {
    return toSelectedRecordsCall({ functionName: 'every', propertyPath });
  }

  return isDefined(getFeatureFlagVariablePath(operand))
    ? toEqualityNode({
        isStrict: true,
        firstOperand: operand,
        secondOperand: true,
      })
    : undefined;
};

const toNegatedNode = (
  child: ConditionalEvaluationNode | undefined,
): ConditionalEvaluationNode | undefined =>
  isDefined(child) ? { type: 'NOT', child } : undefined;

const toComparisonNode = ({
  operator,
  operands,
}: {
  operator: string;
  operands: unknown;
}): ConditionalEvaluationNode | undefined => {
  if (!isArray(operands) || operands.length !== 2) {
    return undefined;
  }

  const [firstOperand, secondOperand] = operands;

  switch (operator) {
    case 'in':
      return toMembershipNode({ firstOperand, secondOperand });
    case '==':
      return toEqualityNode({ isStrict: false, firstOperand, secondOperand });
    case '===':
      return toEqualityNode({ isStrict: true, firstOperand, secondOperand });
    case '!=':
      return toNegatedNode(
        toEqualityNode({ isStrict: false, firstOperand, secondOperand }),
      );
    case '!==':
      return toNegatedNode(
        toEqualityNode({ isStrict: true, firstOperand, secondOperand }),
      );
    default:
      return undefined;
  }
};

export const fromLegacyJsonLogicToConditionalAvailability = (
  jsonLogic: unknown,
): ConditionalEvaluationNode | undefined => {
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
      fromLegacyJsonLogicToConditionalAvailability(operand),
    );

    return children.every(isDefined)
      ? joinConditionalEvaluationNodes({
          logicalOperator: operator === 'and' ? 'AND' : 'OR',
          nodes: children,
        })
      : undefined;
  }

  if (operator === '!' || operator === '!!') {
    const truthinessOperands = isArray(operands) ? operands : [operands];

    if (truthinessOperands.length !== 1) {
      return undefined;
    }

    const [truthinessOperand] = truthinessOperands;

    const truthinessNode =
      toVariableTruthinessNode(truthinessOperand) ??
      fromLegacyJsonLogicToConditionalAvailability(truthinessOperand);

    return operator === '!' ? toNegatedNode(truthinessNode) : truthinessNode;
  }

  return toComparisonNode({ operator, operands });
};
