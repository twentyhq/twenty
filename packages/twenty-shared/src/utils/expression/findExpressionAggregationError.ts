import { FORMULA_AGGREGATE_MAXIMUM_ARGUMENT_COUNT } from '@/constants/FormulaAggregateMaximumArgumentCount';
import { type ExpressionInstruction } from '@/types/ExpressionInstruction';
import { type FormulaAggregateFunctionName } from '@/types/FormulaAggregateFunctionName';
import { type ValidationRuleErrorCode } from '@/types/ValidationRuleErrorCode';
import { type ValidationRuleErrorParams } from '@/types/ValidationRuleErrorParams';
import { isFormulaAggregateFunctionName } from '@/utils/formula/isFormulaAggregateFunctionName';
import { isDefined } from '@/utils/validation/isDefined';

type ExpressionAggregationError = {
  errorMessage: string;
  errorCode: ValidationRuleErrorCode;
  errorParams: ValidationRuleErrorParams;
};

type AggregationStackEntry =
  | { kind: 'path'; path: string }
  | {
      kind: 'value';
      toManyRelationNames: ReadonlySet<string>;
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

const walkInstructions = ({
  instructions,
  toManyRelationNameByPath,
  allowAggregates,
}: {
  instructions: ExpressionInstruction[];
  toManyRelationNameByPath: ReadonlyMap<string, string>;
  allowAggregates: boolean;
}): AggregationStackEntry | undefined => {
  const stack: AggregationStackEntry[] = [];

  const toValue = (entry: AggregationStackEntry | undefined) => {
    if (!isDefined(entry) || entry.kind === 'value') {
      return {
        toManyRelationNames: entry?.toManyRelationNames ?? new Set<string>(),
        hasAggregate: entry?.hasAggregate ?? false,
      };
    }

    const toManyRelationName = toManyRelationNameByPath.get(entry.path);

    return {
      toManyRelationNames: new Set(
        isDefined(toManyRelationName) ? [toManyRelationName] : [],
      ),
      hasAggregate: false,
    };
  };

  const mergeValues = (
    entries: (AggregationStackEntry | undefined)[],
  ): AggregationStackEntry => {
    const values = entries.map(toValue);

    return {
      kind: 'value',
      toManyRelationNames: new Set(
        values.flatMap(({ toManyRelationNames }) => [...toManyRelationNames]),
      ),
      hasAggregate: values.some(({ hasAggregate }) => hasAggregate),
    };
  };

  const popEntries = (count: number) =>
    stack.splice(Math.max(stack.length - count, 0), count);

  const aggregate = ({
    functionName,
    argumentEntries,
  }: {
    functionName: FormulaAggregateFunctionName;
    argumentEntries: AggregationStackEntry[];
  }): AggregationStackEntry | undefined => {
    const [relationEntry, ...conditionEntries] = argumentEntries;
    const relationName =
      relationEntry?.kind === 'path'
        ? toManyRelationNameByPath.get(relationEntry.path)
        : undefined;

    // min and max of plain values stay the scalar functions
    if (
      !isDefined(relationName) &&
      (functionName === 'min' || functionName === 'max')
    ) {
      return undefined;
    }

    if (!allowAggregates) {
      return throwAggregationError({
        errorMessage: `${functionName}() reads related records, which only a formula can do`,
        errorCode: 'AGGREGATE_NOT_ALLOWED',
        errorParams: { functionName },
      });
    }

    const isRelationArgumentValid =
      isDefined(relationName) &&
      relationEntry?.kind === 'path' &&
      (functionName === 'count'
        ? relationEntry.path === relationName
        : relationEntry.path !== relationName);

    if (
      !isRelationArgumentValid ||
      argumentEntries.length > FORMULA_AGGREGATE_MAXIMUM_ARGUMENT_COUNT
    ) {
      return throwAggregationError({
        errorMessage: `${functionName}() needs a relation, for example count(tasks) or sum(deals.amount)`,
        errorCode: 'INVALID_AGGREGATE_ARGUMENT',
        errorParams: { functionName },
      });
    }

    for (const conditionValue of conditionEntries.map(toValue)) {
      if (conditionValue.hasAggregate) {
        return throwAggregationError({
          errorMessage: `${functionName}() cannot contain another aggregate`,
          errorCode: 'NESTED_AGGREGATE',
          errorParams: { functionName },
        });
      }

      const otherRelationName = [...conditionValue.toManyRelationNames].find(
        (toManyRelationName) => toManyRelationName !== relationName,
      );

      if (isDefined(otherRelationName)) {
        return throwAggregationError({
          errorMessage: `The condition of ${functionName}() cannot read "${otherRelationName}"`,
          errorCode: 'INVALID_AGGREGATE_ARGUMENT',
          errorParams: { functionName, relationFieldName: otherRelationName },
        });
      }
    }

    return {
      kind: 'value',
      toManyRelationNames: new Set(),
      hasAggregate: true,
    };
  };

  for (const { type, value } of instructions) {
    switch (type) {
      case 'IVAR':
        stack.push({ kind: 'path', path: String(value) });
        break;
      case 'IMEMBER': {
        const entry = stack.pop();

        stack.push(
          entry?.kind === 'path'
            ? { kind: 'path', path: `${entry.path}.${String(value)}` }
            : mergeValues([entry]),
        );
        break;
      }
      case 'IEXPR':
        stack.push(
          mergeValues([
            Array.isArray(value)
              ? walkInstructions({
                  instructions: value,
                  toManyRelationNameByPath,
                  allowAggregates,
                })
              : undefined,
          ]),
        );
        break;
      case 'IOP1':
        stack.push(mergeValues(popEntries(1)));
        break;
      case 'IOP2':
        stack.push(mergeValues(popEntries(2)));
        break;
      case 'IARRAY':
        stack.push(mergeValues(popEntries(Number(value))));
        break;
      case 'IFUNCALL': {
        const argumentEntries = popEntries(Number(value));
        const functionEntry = stack.pop();
        const aggregateEntry =
          functionEntry?.kind === 'path' &&
          isFormulaAggregateFunctionName(functionEntry.path)
            ? aggregate({
                functionName: functionEntry.path,
                argumentEntries,
              })
            : undefined;

        stack.push(aggregateEntry ?? mergeValues(argumentEntries));
        break;
      }
      default:
        stack.push(mergeValues([]));
    }
  }

  return stack.pop();
};

// Finds a read of a one-to-many relation outside an aggregate over it, or a misused aggregate
export const findExpressionAggregationError = ({
  instructions,
  toManyRelationNameByPath,
  allowAggregates,
}: {
  instructions: ExpressionInstruction[];
  toManyRelationNameByPath: ReadonlyMap<string, string>;
  allowAggregates: boolean;
}): ExpressionAggregationError | null => {
  try {
    const rootEntry = walkInstructions({
      instructions,
      toManyRelationNameByPath,
      allowAggregates,
    });
    const [toManyRelationName] =
      rootEntry?.kind === 'path'
        ? [toManyRelationNameByPath.get(rootEntry.path)].filter(isDefined)
        : [...(rootEntry?.toManyRelationNames ?? [])];

    return isDefined(toManyRelationName)
      ? {
          errorMessage: `"${toManyRelationName}" has many records: read it inside count(), sum(), avg(), min() or max()`,
          errorCode: 'TO_MANY_RELATION_OUTSIDE_AGGREGATE',
          errorParams: { fieldName: toManyRelationName },
        }
      : null;
  } catch (error) {
    if (error instanceof ExpressionAggregationException) {
      return error.aggregationError;
    }

    throw error;
  }
};
