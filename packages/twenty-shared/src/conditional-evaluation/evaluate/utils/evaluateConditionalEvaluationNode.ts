import { isFunction, isObject, isString } from '@sniptt/guards';

import { CONDITIONAL_EVALUATION_FUNCTIONS } from '@/conditional-evaluation/common/constants/ConditionalEvaluationFunctions';
import { type ConditionalEvaluationComparisonOperator } from '@/conditional-evaluation/common/types/ConditionalEvaluationComparisonOperator';
import { type ConditionalEvaluationNode } from '@/conditional-evaluation/common/types/ConditionalEvaluationNode';
import { FORBIDDEN_PROPERTY_NAMES } from '@/constants/ForbiddenPropertyNames';
import { isDefined } from '@/utils/validation/isDefined';

type EvaluationContext = Record<string, unknown>;

const CONDITIONAL_EVALUATION_FUNCTION_BY_NAME = new Map(
  Object.entries(CONDITIONAL_EVALUATION_FUNCTIONS),
);

const isForbiddenPathSegment = (segment: string) =>
  FORBIDDEN_PROPERTY_NAMES.has(segment);

const readPathSegmentOrThrow = (value: unknown, segment: string): unknown => {
  if (!isDefined(value) || isForbiddenPathSegment(segment)) {
    throw new Error(`Cannot read "${segment}"`);
  }

  const segmentValue: unknown = Reflect.get(Object(value), segment);

  if (isObject(value) && isFunction(segmentValue)) {
    throw new Error(`"${segment}" is not a value`);
  }

  return segmentValue;
};

const readPathOrThrow = ({
  path,
  context,
}: {
  path: string;
  context: EvaluationContext;
}): unknown => {
  const [rootName, ...segments] = path.split('.');

  if (!isDefined(rootName) || isForbiddenPathSegment(rootName)) {
    throw new Error(`Cannot read "${path}"`);
  }

  const rootValue = context[rootName];

  if (rootValue === undefined || isFunction(rootValue)) {
    throw new Error(`Undefined variable "${rootName}"`);
  }

  return segments.reduce<unknown>(readPathSegmentOrThrow, rootValue);
};

const toOrderedOperand = (value: unknown): unknown =>
  isObject(value) || isFunction(value) ? String(value) : value;

const compareValues = ({
  operator,
  left,
  right,
}: {
  operator: ConditionalEvaluationComparisonOperator;
  left: unknown;
  right: unknown;
}): boolean => {
  if (operator === 'EQUAL') {
    return left === right;
  }

  if (operator === 'NOT_EQUAL') {
    return left !== right;
  }

  const leftOperand = toOrderedOperand(left);
  const rightOperand = toOrderedOperand(right);
  const [leftOrdered, rightOrdered] =
    isString(leftOperand) && isString(rightOperand)
      ? [leftOperand, rightOperand]
      : [Number(leftOperand), Number(rightOperand)];

  switch (operator) {
    case 'LESS_THAN':
      return leftOrdered < rightOrdered;
    case 'LESS_THAN_OR_EQUAL':
      return leftOrdered <= rightOrdered;
    case 'GREATER_THAN':
      return leftOrdered > rightOrdered;
    case 'GREATER_THAN_OR_EQUAL':
      return leftOrdered >= rightOrdered;
  }
};

const computeNodeValue = ({
  node,
  context,
}: {
  node: ConditionalEvaluationNode;
  context: EvaluationContext;
}): unknown => {
  const computeChildValue = (childNode: ConditionalEvaluationNode) =>
    computeNodeValue({ node: childNode, context });

  switch (node.type) {
    case 'LITERAL':
      return node.value;
    case 'VARIABLE':
      return readPathOrThrow({ path: node.path, context });
    case 'COMPARISON':
      return compareValues({
        operator: node.operator,
        left: computeChildValue(node.left),
        right: computeChildValue(node.right),
      });
    case 'GROUP': {
      const isChildTruthy = (childNode: ConditionalEvaluationNode) =>
        Boolean(computeChildValue(childNode));

      if (node.logicalOperator === 'AND') {
        return node.children.every(isChildTruthy);
      }

      return node.children.some(isChildTruthy);
    }
    case 'NOT':
      return !computeChildValue(node.child);
    case 'FUNCTION_CALL': {
      const conditionalEvaluationFunction =
        CONDITIONAL_EVALUATION_FUNCTION_BY_NAME.get(node.functionName);

      if (!isDefined(conditionalEvaluationFunction)) {
        throw new Error(`Unknown function "${node.functionName}"`);
      }

      return Reflect.apply(
        conditionalEvaluationFunction,
        undefined,
        node.arguments.map(computeChildValue),
      );
    }
  }
};

export const evaluateConditionalEvaluationNode = ({
  node,
  context,
}: {
  node: ConditionalEvaluationNode | null | undefined;
  context: EvaluationContext;
}): boolean => {
  if (!isDefined(node)) {
    return true;
  }

  try {
    return computeNodeValue({ node, context }) === true;
  } catch {
    return false;
  }
};
