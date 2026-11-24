import { isBoolean, isNumber, isString } from '@sniptt/guards';
import { type ExpressionInstruction } from 'twenty-shared/types';
import {
  isDefined,
  isFormulaAggregateFunctionName,
  parseExpressionInstructions,
} from 'twenty-shared/utils';

import { FormulaSqlCompilationException } from 'src/engine/metadata-modules/formula-field/exceptions/formula-sql-compilation.exception';
import { type FormulaSqlAggregationSource } from 'src/engine/metadata-modules/formula-field/types/formula-sql-aggregation-source.type';
import { type FormulaSqlValue } from 'src/engine/metadata-modules/formula-field/types/formula-sql-value.type';
import { compileFormulaSqlAggregateOrThrow } from 'src/engine/metadata-modules/formula-field/utils/compile-formula-sql-aggregate.util';
import { compileFormulaSqlMembershipOrThrow } from 'src/engine/metadata-modules/formula-field/utils/compile-formula-sql-membership.util';
import { compileFormulaSqlFunctionOrThrow } from 'src/engine/metadata-modules/formula-field/utils/formula-sql-functions.util';
import {
  compileFormulaSqlBinaryOperatorOrThrow,
  compileFormulaSqlUnaryOperatorOrThrow,
} from 'src/engine/metadata-modules/formula-field/utils/compile-formula-sql-operator.util';
import { buildTextLiteralValueOrThrow } from 'src/engine/metadata-modules/formula-field/utils/formula-sql-values.util';

type FormulaSqlStackEntry =
  | { kind: 'path'; path: string }
  | { kind: 'value'; value: FormulaSqlValue }
  | { kind: 'list'; values: FormulaSqlValue[] };

export type FormulaSqlReferenceResolver = (
  path: string,
) => FormulaSqlValue | undefined;

export type FormulaSqlAggregationSourceResolver = (
  relationFieldName: string,
) => FormulaSqlAggregationSource | undefined;

const NOW_PATH = 'now';

const compileLiteralOrThrow = (literal: unknown): FormulaSqlValue => {
  if (isString(literal)) {
    return buildTextLiteralValueOrThrow(literal);
  }

  if (isBoolean(literal)) {
    return { sql: literal ? 'TRUE' : 'FALSE', type: 'boolean' };
  }

  if (isNumber(literal) && Number.isFinite(literal)) {
    return { sql: `${literal}::numeric`, type: 'number', isNeverNull: true };
  }

  throw new FormulaSqlCompilationException({
    message: `"${String(literal)}" is not supported in a formula`,
  });
};

const AGGREGATE_MAXIMUM_ARGUMENT_COUNT = 2;

const compileInstructions = ({
  instructions,
  resolveReference,
  resolveAggregationSource,
}: {
  instructions: ExpressionInstruction[];
  resolveReference: FormulaSqlReferenceResolver;
  resolveAggregationSource?: FormulaSqlAggregationSourceResolver;
}): FormulaSqlValue => {
  const stack: FormulaSqlStackEntry[] = [];

  const popEntryOrThrow = (): FormulaSqlStackEntry => {
    const entry = stack.pop();

    if (!isDefined(entry)) {
      throw new FormulaSqlCompilationException({
        message: 'Formula is incomplete',
      });
    }

    return entry;
  };

  const toValueOrThrow = (entry: FormulaSqlStackEntry): FormulaSqlValue => {
    if (entry.kind === 'value') {
      return entry.value;
    }

    if (entry.kind === 'list') {
      throw new FormulaSqlCompilationException({
        message: 'A list can only be written after "in"',
      });
    }

    if (entry.path === NOW_PATH) {
      return { sql: 'NOW()', type: 'dateTime' };
    }

    const value = resolveReference(entry.path);

    if (!isDefined(value)) {
      throw new FormulaSqlCompilationException({
        message: `"${entry.path}" cannot be read by a formula`,
      });
    }

    return value;
  };

  const popValueOrThrow = (): FormulaSqlValue =>
    toValueOrThrow(popEntryOrThrow());

  const popEntriesOrThrow = (count: number): FormulaSqlStackEntry[] =>
    Array.from({ length: count }, popEntryOrThrow).reverse();

  const popValuesOrThrow = (count: number): FormulaSqlValue[] =>
    popEntriesOrThrow(count).map(toValueOrThrow);

  // Undefined for min and max of plain values, which stay scalar functions
  const compileAggregate = ({
    name,
    argumentEntries,
  }: {
    name: string;
    argumentEntries: FormulaSqlStackEntry[];
  }): FormulaSqlValue | undefined => {
    if (!isFormulaAggregateFunctionName(name)) {
      return undefined;
    }

    const [relationEntry, conditionEntry] = argumentEntries;
    const [relationFieldName] =
      relationEntry?.kind === 'path' ? relationEntry.path.split('.') : [];
    const aggregationSource = isDefined(relationFieldName)
      ? resolveAggregationSource?.(relationFieldName)
      : undefined;

    if (!isDefined(relationEntry) || !isDefined(aggregationSource)) {
      if (name === 'min' || name === 'max') {
        return undefined;
      }

      throw new FormulaSqlCompilationException({
        message: `${name}() needs a relation with many records`,
      });
    }

    if (argumentEntries.length > AGGREGATE_MAXIMUM_ARGUMENT_COUNT) {
      throw new FormulaSqlCompilationException({
        message: `${name}() takes a relation and a condition`,
      });
    }

    return compileFormulaSqlAggregateOrThrow({
      functionName: name,
      relationFieldName,
      aggregationSource,
      aggregatedValue:
        name === 'count' ? undefined : toValueOrThrow(relationEntry),
      condition: isDefined(conditionEntry)
        ? toValueOrThrow(conditionEntry)
        : undefined,
    });
  };

  for (const { type, value } of instructions) {
    switch (type) {
      case 'INUMBER':
        stack.push({ kind: 'value', value: compileLiteralOrThrow(value) });
        break;
      case 'IVAR':
        stack.push({ kind: 'path', path: String(value) });
        break;
      case 'IMEMBER': {
        const entry = popEntryOrThrow();

        if (entry.kind !== 'path') {
          throw new FormulaSqlCompilationException({
            message: `".${String(value)}" can only follow a field`,
          });
        }

        stack.push({ kind: 'path', path: `${entry.path}.${String(value)}` });
        break;
      }
      case 'IEXPR':
        if (!Array.isArray(value)) {
          throw new FormulaSqlCompilationException({
            message: 'Formula is incomplete',
          });
        }

        stack.push({
          kind: 'value',
          value: compileInstructions({
            instructions: value,
            resolveReference,
            resolveAggregationSource,
          }),
        });
        break;
      case 'IARRAY':
        stack.push({ kind: 'list', values: popValuesOrThrow(Number(value)) });
        break;
      case 'IOP1':
        stack.push({
          kind: 'value',
          value: compileFormulaSqlUnaryOperatorOrThrow({
            operator: String(value),
            operand: popValueOrThrow(),
          }),
        });
        break;
      case 'IOP2': {
        const rightEntry = popEntryOrThrow();
        const left = popValueOrThrow();

        if (value === 'in' && rightEntry.kind === 'list') {
          stack.push({
            kind: 'value',
            value: compileFormulaSqlMembershipOrThrow({
              value: left,
              candidates: rightEntry.values,
            }),
          });
          break;
        }

        stack.push({
          kind: 'value',
          value: compileFormulaSqlBinaryOperatorOrThrow({
            operator: String(value),
            left,
            right: toValueOrThrow(rightEntry),
          }),
        });
        break;
      }
      case 'IFUNCALL': {
        const argumentEntries = popEntriesOrThrow(Number(value));
        const functionEntry = popEntryOrThrow();

        if (functionEntry.kind !== 'path') {
          throw new FormulaSqlCompilationException({
            message: 'Unknown function',
          });
        }

        stack.push({
          kind: 'value',
          value:
            compileAggregate({ name: functionEntry.path, argumentEntries }) ??
            compileFormulaSqlFunctionOrThrow({
              name: functionEntry.path,
              formulaSqlValues: argumentEntries.map(toValueOrThrow),
            }),
        });
        break;
      }
      default:
        throw new FormulaSqlCompilationException({
          message: 'This syntax is not supported in a formula',
        });
    }
  }

  const result = popValueOrThrow();

  if (stack.length > 0) {
    throw new FormulaSqlCompilationException({
      message: 'Formula is incomplete',
    });
  }

  return result;
};

export const compileFormulaExpressionToSqlOrThrow = ({
  expression,
  resolveReference,
  resolveAggregationSource,
}: {
  expression: string;
  resolveReference: FormulaSqlReferenceResolver;
  resolveAggregationSource?: FormulaSqlAggregationSourceResolver;
}): FormulaSqlValue => {
  try {
    return compileInstructions({
      instructions: parseExpressionInstructions(expression),
      resolveReference,
      resolveAggregationSource,
    });
  } catch (error) {
    if (error instanceof FormulaSqlCompilationException) {
      throw error;
    }

    throw new FormulaSqlCompilationException({
      message: error instanceof Error ? error.message : String(error),
    });
  }
};
