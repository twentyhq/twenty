import { isBoolean, isNumber, isString } from '@sniptt/guards';
import { type ExpressionInstruction } from 'twenty-shared/types';
import { isDefined, parseExpressionInstructions } from 'twenty-shared/utils';

import { FormulaSqlCompilationException } from 'src/engine/metadata-modules/formula-field/exceptions/formula-sql-compilation.exception';
import { type FormulaSqlValue } from 'src/engine/metadata-modules/formula-field/types/formula-sql-value.type';
import { compileFormulaSqlFunction } from 'src/engine/metadata-modules/formula-field/utils/formula-sql-functions.util';
import {
  compileFormulaSqlBinaryOperator,
  compileFormulaSqlMembership,
  compileFormulaSqlUnaryOperator,
} from 'src/engine/metadata-modules/formula-field/utils/compile-formula-sql-operator.util';
import { buildTextLiteralValue } from 'src/engine/metadata-modules/formula-field/utils/formula-sql-values.util';

type FormulaSqlStackEntry =
  | { kind: 'path'; path: string }
  | { kind: 'value'; value: FormulaSqlValue }
  | { kind: 'list'; values: FormulaSqlValue[] };

export type FormulaSqlReferenceResolver = (
  path: string,
) => FormulaSqlValue | undefined;

export type FormulaSqlCompilationResult =
  | { isValid: true; value: FormulaSqlValue }
  | { isValid: false; errorMessage: string };

const NOW_PATH = 'now';

const compileLiteral = (literal: unknown): FormulaSqlValue => {
  if (isString(literal)) {
    return buildTextLiteralValue(literal);
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

const compileInstructions = ({
  instructions,
  resolveReference,
}: {
  instructions: ExpressionInstruction[];
  resolveReference: FormulaSqlReferenceResolver;
}): FormulaSqlValue => {
  const stack: FormulaSqlStackEntry[] = [];

  const popEntry = (): FormulaSqlStackEntry => {
    const entry = stack.pop();

    if (!isDefined(entry)) {
      throw new FormulaSqlCompilationException({
        message: 'Formula is incomplete',
      });
    }

    return entry;
  };

  const toValue = (entry: FormulaSqlStackEntry): FormulaSqlValue => {
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

  const popValue = (): FormulaSqlValue => toValue(popEntry());

  const popValues = (count: number): FormulaSqlValue[] =>
    Array.from({ length: count }, popValue).reverse();

  for (const { type, value } of instructions) {
    switch (type) {
      case 'INUMBER':
        stack.push({ kind: 'value', value: compileLiteral(value) });
        break;
      case 'IVAR':
        stack.push({ kind: 'path', path: String(value) });
        break;
      case 'IMEMBER': {
        const entry = popEntry();

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
          value: compileInstructions({ instructions: value, resolveReference }),
        });
        break;
      case 'IARRAY':
        stack.push({ kind: 'list', values: popValues(Number(value)) });
        break;
      case 'IOP1':
        stack.push({
          kind: 'value',
          value: compileFormulaSqlUnaryOperator({
            operator: String(value),
            operand: popValue(),
          }),
        });
        break;
      case 'IOP2': {
        const rightEntry = popEntry();
        const left = popValue();

        stack.push({
          kind: 'value',
          value:
            value === 'in' && rightEntry.kind === 'list'
              ? compileFormulaSqlMembership({
                  value: left,
                  candidates: rightEntry.values,
                })
              : compileFormulaSqlBinaryOperator({
                  operator: String(value),
                  left,
                  right: toValue(rightEntry),
                }),
        });
        break;
      }
      case 'IFUNCALL': {
        const formulaSqlValues = popValues(Number(value));
        const functionEntry = popEntry();

        if (functionEntry.kind !== 'path') {
          throw new FormulaSqlCompilationException({
            message: 'Unknown function',
          });
        }

        stack.push({
          kind: 'value',
          value: compileFormulaSqlFunction({
            name: functionEntry.path,
            formulaSqlValues,
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

  const result = popValue();

  if (stack.length > 0) {
    throw new FormulaSqlCompilationException({
      message: 'Formula is incomplete',
    });
  }

  return result;
};

// Types are checked here so the generated SQL cannot fail on a row at query time
export const compileFormulaExpressionToSql = ({
  expression,
  resolveReference,
}: {
  expression: string;
  resolveReference: FormulaSqlReferenceResolver;
}): FormulaSqlCompilationResult => {
  try {
    return {
      isValid: true,
      value: compileInstructions({
        instructions: parseExpressionInstructions(expression),
        resolveReference,
      }),
    };
  } catch (error) {
    return {
      isValid: false,
      errorMessage: error instanceof Error ? error.message : String(error),
    };
  }
};
