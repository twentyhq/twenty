import {
  isFunction,
  isNonEmptyArray,
  isObject,
  isString,
} from '@sniptt/guards';

import { CONDITIONAL_AVAILABILITY_FORBIDDEN_PATH_SEGMENT_PATTERN } from '@/constants/ConditionalAvailabilityForbiddenPathSegmentPattern';
import { CONDITIONAL_AVAILABILITY_FUNCTIONS } from '@/constants/ConditionalAvailabilityFunctions';
import { CONDITIONAL_AVAILABILITY_SELECTED_RECORDS_VARIABLE_NAME } from '@/constants/ConditionalAvailabilitySelectedRecordsVariableName';
import { type ConditionalAvailabilityComparisonOperator } from '@/types/ConditionalAvailabilityComparisonOperator';
import { type ConditionalAvailabilityNode } from '@/types/ConditionalAvailabilityNode';
import { type ConditionalAvailabilityRecordFilterMatcher } from '@/types/ConditionalAvailabilityRecordFilterMatcher';
import { isDefined } from '@/utils/validation/isDefined';

type EvaluationContext = Record<string, unknown>;

const isForbiddenPathSegment = (segment: string) =>
  CONDITIONAL_AVAILABILITY_FORBIDDEN_PATH_SEGMENT_PATTERN.test(segment);

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
  const leftOperand = toOrderedOperand(left);
  const rightOperand = toOrderedOperand(right);
  const areBothText = isString(leftOperand) && isString(rightOperand);

  switch (operator) {
    case 'EQUAL':
      return left === right;
    case 'NOT_EQUAL':
      return left !== right;
    case 'LESS_THAN':
      return areBothText
        ? leftOperand < rightOperand
        : Number(leftOperand) < Number(rightOperand);
    case 'LESS_THAN_OR_EQUAL':
      return areBothText
        ? leftOperand <= rightOperand
        : Number(leftOperand) <= Number(rightOperand);
    case 'GREATER_THAN':
      return areBothText
        ? leftOperand > rightOperand
        : Number(leftOperand) > Number(rightOperand);
    case 'GREATER_THAN_OR_EQUAL':
      return areBothText
        ? leftOperand >= rightOperand
        : Number(leftOperand) >= Number(rightOperand);
  }
};

const computeNodeValue = ({
  node,
  context,
  isRecordMatchingRecordFilter,
}: {
  node: ConditionalAvailabilityNode;
  context: EvaluationContext;
  isRecordMatchingRecordFilter:
    | ConditionalAvailabilityRecordFilterMatcher
    | undefined;
}): unknown => {
  const computeChildValue = (childNode: ConditionalAvailabilityNode) =>
    computeNodeValue({
      node: childNode,
      context,
      isRecordMatchingRecordFilter,
    });

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
    case 'SELECTED_RECORDS': {
      if (!isDefined(isRecordMatchingRecordFilter)) {
        throw new Error('Record filters cannot be evaluated here');
      }

      const selectedRecords: unknown =
        context[CONDITIONAL_AVAILABILITY_SELECTED_RECORDS_VARIABLE_NAME];

      if (!isNonEmptyArray(selectedRecords)) {
        return false;
      }

      const isRecordMatching = (record: unknown) =>
        isRecordMatchingRecordFilter({
          record,
          recordFilter: node.recordFilter,
        });

      switch (node.quantifier) {
        case 'EVERY':
          return selectedRecords.every(isRecordMatching);
        case 'SOME':
          return selectedRecords.some(isRecordMatching);
        case 'NONE':
          return !selectedRecords.some(isRecordMatching);
      }
    }
    case 'CALL': {
      const functionDeclaration = Object.entries(
        CONDITIONAL_AVAILABILITY_FUNCTIONS,
      ).find(([functionName]) => functionName === node.functionName)?.[1];

      if (!isDefined(functionDeclaration)) {
        throw new Error(`Unknown function "${node.functionName}"`);
      }

      const callResult: unknown = Reflect.apply(
        functionDeclaration.evaluate,
        undefined,
        node.arguments.map(computeChildValue),
      );

      return callResult;
    }
  }
};

export const evaluateConditionalAvailabilityNode = ({
  node,
  context,
  isRecordMatchingRecordFilter,
}: {
  node: ConditionalAvailabilityNode | null | undefined;
  context: EvaluationContext;
  isRecordMatchingRecordFilter?: ConditionalAvailabilityRecordFilterMatcher;
}): boolean => {
  if (!isDefined(node)) {
    return true;
  }

  try {
    return (
      computeNodeValue({ node, context, isRecordMatchingRecordFilter }) === true
    );
  } catch {
    return false;
  }
};
