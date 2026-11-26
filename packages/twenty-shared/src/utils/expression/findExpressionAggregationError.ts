import { type ExpressionNode } from '@/expression/types/ExpressionNode';
import { type ValidationRuleErrorCode } from '@/types/ValidationRuleErrorCode';
import { type ValidationRuleErrorParams } from '@/types/ValidationRuleErrorParams';
import { getExpressionNodeChildren } from '@/expression/utils/internal/getExpressionNodeChildren';
import { getFormulaAggregateCall } from '@/utils/formula/getFormulaAggregateCall';
import { isDefined } from '@/utils/validation/isDefined';

type ExpressionAggregationError = {
  errorMessage: string;
  errorCode: ValidationRuleErrorCode;
  errorParams: ValidationRuleErrorParams;
};

type ExpressionReads = {
  toManyRelationNames: Set<string>;
  hasAggregate: boolean;
};

class ExpressionAggregationException extends Error {
  constructor(readonly aggregationError: ExpressionAggregationError) {
    super(aggregationError.errorMessage);
  }
}

const throwAggregationError = (
  aggregationError: ExpressionAggregationError,
): never => {
  throw new ExpressionAggregationException(aggregationError);
};

const mergeReads = (reads: ExpressionReads[]): ExpressionReads => ({
  toManyRelationNames: new Set(
    reads.flatMap(({ toManyRelationNames }) => [...toManyRelationNames]),
  ),
  hasAggregate: reads.some(({ hasAggregate }) => hasAggregate),
});

const collectReads = ({
  node,
  toManyRelationNameByPath,
  shouldAllowAggregates,
}: {
  node: ExpressionNode;
  toManyRelationNameByPath: ReadonlyMap<string, string>;
  shouldAllowAggregates: boolean;
}): ExpressionReads => {
  if (node.type === 'VARIABLE') {
    const toManyRelationName = toManyRelationNameByPath.get(node.path);

    return {
      toManyRelationNames: new Set(
        isDefined(toManyRelationName) ? [toManyRelationName] : [],
      ),
      hasAggregate: false,
    };
  }

  const childReads = getExpressionNodeChildren(node).map((child) =>
    collectReads({
      node: child,
      toManyRelationNameByPath,
      shouldAllowAggregates,
    }),
  );
  const aggregateCall =
    node.type === 'FUNCTION_CALL'
      ? getFormulaAggregateCall({
          callNode: node,
          getToManyRelationName: (path) => toManyRelationNameByPath.get(path),
        })
      : undefined;

  if (!isDefined(aggregateCall)) {
    return mergeReads(childReads);
  }

  const { functionName } = aggregateCall;

  if (!shouldAllowAggregates) {
    return throwAggregationError({
      errorMessage: `${functionName}() reads related records, which only a formula can do`,
      errorCode: 'AGGREGATE_NOT_ALLOWED',
      errorParams: { functionName },
    });
  }

  if (!aggregateCall.isValid) {
    return throwAggregationError({
      errorMessage: `${functionName}() needs a relation, for example count(tasks) or sum(deals.amount)`,
      errorCode: 'INVALID_AGGREGATE_ARGUMENT',
      errorParams: { functionName },
    });
  }

  const [, ...conditionReads] = childReads;

  for (const { hasAggregate, toManyRelationNames } of conditionReads) {
    if (hasAggregate) {
      return throwAggregationError({
        errorMessage: `${functionName}() cannot contain another aggregate`,
        errorCode: 'NESTED_AGGREGATE',
        errorParams: { functionName },
      });
    }

    const otherRelationName = [...toManyRelationNames].find(
      (toManyRelationName) => toManyRelationName !== aggregateCall.relationName,
    );

    if (isDefined(otherRelationName)) {
      return throwAggregationError({
        errorMessage: `The condition of ${functionName}() cannot read "${otherRelationName}"`,
        errorCode: 'INVALID_AGGREGATE_ARGUMENT',
        errorParams: { functionName, relationFieldName: otherRelationName },
      });
    }
  }

  return { toManyRelationNames: new Set(), hasAggregate: true };
};

// Finds a read of a one-to-many relation outside an aggregate over it, or a misused aggregate
export const findExpressionAggregationError = ({
  node,
  toManyRelationNameByPath,
  shouldAllowAggregates,
}: {
  node: ExpressionNode;
  toManyRelationNameByPath: ReadonlyMap<string, string>;
  shouldAllowAggregates: boolean;
}): ExpressionAggregationError | null => {
  try {
    const [toManyRelationName] = collectReads({
      node,
      toManyRelationNameByPath,
      shouldAllowAggregates,
    }).toManyRelationNames;

    if (!isDefined(toManyRelationName)) {
      return null;
    }

    return {
      errorMessage: `"${toManyRelationName}" has many records: read it inside count(), sum(), avg(), min() or max()`,
      errorCode: 'TO_MANY_RELATION_OUTSIDE_AGGREGATE',
      errorParams: { fieldName: toManyRelationName },
    };
  } catch (error) {
    if (error instanceof ExpressionAggregationException) {
      return error.aggregationError;
    }

    throw error;
  }
};
