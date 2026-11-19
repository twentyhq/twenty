import { isFunction, isObject, isString } from '@sniptt/guards';

import { CONDITIONAL_AVAILABILITY_FORBIDDEN_PROPERTY_NAMES } from '@/constants/ConditionalAvailabilityForbiddenPropertyNames';
import { CONDITIONAL_AVAILABILITY_FUNCTIONS } from '@/constants/ConditionalAvailabilityFunctions';
import { type ConditionalAvailabilityComparisonOperator } from '@/types/ConditionalAvailabilityComparisonOperator';
import { type ConditionalAvailabilityNode } from '@/types/ConditionalAvailabilityNode';
import { isDefined } from '@/utils/validation/isDefined';

type EvaluationContext = Record<string, unknown>;

const isForbiddenPathSegment = (segment: string) =>
  CONDITIONAL_AVAILABILITY_FORBIDDEN_PROPERTY_NAMES.has(segment);

const readPathSegment = (value: unknown, segment: string): unknown => {
  if (!isDefined(value) || isForbiddenPathSegment(segment)) {
    throw new Error(`Cannot read "${segment}"`);
  }

  const segmentValue: unknown = Reflect.get(Object(value), segment);

  if (isObject(value) && isFunction(segmentValue)) {
    throw new Error(`"${segment}" is not a value`);
  }

  return segmentValue;
};

const readPath = ({
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

  return segments.reduce<unknown>(readPathSegment, rootValue);
};

const toOrderedOperand = (value: unknown): unknown =>
  isObject(value) || isFunction(value) ? String(value) : value;

const compareValues = ({
  operator,
  left,
  right,
}: {
  operator: ConditionalAvailabilityComparisonOperator;
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
  node: ConditionalAvailabilityNode;
  context: EvaluationContext;
}): unknown => {
  const computeChildValue = (childNode: ConditionalAvailabilityNode) =>
    computeNodeValue({ node: childNode, context });

  switch (node.type) {
    case 'LITERAL':
      return node.value;
    case 'PATH':
      return readPath({ path: node.path, context });
    case 'COMPARISON':
      return compareValues({
        operator: node.operator,
        left: computeChildValue(node.left),
        right: computeChildValue(node.right),
      });
    case 'GROUP':
      return node.logicalOperator === 'AND'
        ? node.children.every((childNode) =>
            Boolean(computeChildValue(childNode)),
          )
        : node.children.some((childNode) =>
            Boolean(computeChildValue(childNode)),
          );
    case 'NOT':
      return !computeChildValue(node.child);
    case 'CALL': {
      const conditionalAvailabilityFunction = Object.entries(
        CONDITIONAL_AVAILABILITY_FUNCTIONS,
      ).find(([functionName]) => functionName === node.functionName)?.[1];

      if (!isDefined(conditionalAvailabilityFunction)) {
        throw new Error(`Unknown function "${node.functionName}"`);
      }

      return Reflect.apply(
        conditionalAvailabilityFunction,
        undefined,
        node.arguments.map(computeChildValue),
      );
    }
  }
};

export const evaluateConditionalAvailabilityNode = ({
  node,
  context,
}: {
  node: ConditionalAvailabilityNode | null | undefined;
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
