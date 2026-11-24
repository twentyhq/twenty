import { isBoolean, isNumber, isString } from '@sniptt/guards';
import { type ExpressionInstruction } from 'twenty-shared/types';
import { isDefined, parseExpressionInstructions } from 'twenty-shared/utils';

import { FormulaSqlCompilationException } from 'src/engine/metadata-modules/formula-field/exceptions/formula-sql-compilation.exception';
import { type FormulaSqlValue } from 'src/engine/metadata-modules/formula-field/types/formula-sql-value.type';
import { compileFormulaSqlFunctionOrThrow } from 'src/engine/metadata-modules/formula-field/utils/formula-sql-functions.util';
import {
  compileFormulaSqlBinaryOperatorOrThrow,
  compileFormulaSqlMembershipOrThrow,
  compileFormulaSqlUnaryOperatorOrThrow,
} from 'src/engine/metadata-modules/formula-field/utils/compile-formula-sql-operator.util';
import { buildTextLiteralValue } from 'src/engine/metadata-modules/formula-field/utils/formula-sql-values.util';

type FormulaSqlStackEntry =
  | { kind: 'path'; path: string }
  | { kind: 'value'; value: FormulaSqlValue }
  | { kind: 'list'; values: FormulaSqlValue[] };

export type FormulaSqlReferenceResolver = (
  path: string,
) => FormulaSqlValue | undefined;

const NOW_PATH = 'now';

const compileLiteralOrThrow = (literal: unknown): FormulaSqlValue => {
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

  const popValuesOrThrow = (count: number): FormulaSqlValue[] =>
    Array.from({ length: count }, popValueOrThrow).reverse();

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
          value: compileInstructions({ instructions: value, resolveReference }),
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

        stack.push({
          kind: 'value',
          value:
            value === 'in' && rightEntry.kind === 'list'
              ? compileFormulaSqlMembershipOrThrow({
                  value: left,
                  candidates: rightEntry.values,
                })
              : compileFormulaSqlBinaryOperatorOrThrow({
                  operator: String(value),
                  left,
                  right: toValueOrThrow(rightEntry),
                }),
        });
        break;
      }
      case 'IFUNCALL': {
        const formulaSqlValues = popValuesOrThrow(Number(value));
        const functionEntry = popEntryOrThrow();

        if (functionEntry.kind !== 'path') {
          throw new FormulaSqlCompilationException({
            message: 'Unknown function',
          });
        }

        stack.push({
          kind: 'value',
          value: compileFormulaSqlFunctionOrThrow({
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

  const result = popValueOrThrow();

  if (stack.length > 0) {
    throw new FormulaSqlCompilationException({
      message: 'Formula is incomplete',
    });
  }

  return result;
};

// Parser errors carry the message to show, so they are reported like compilation errors
export const compileFormulaExpressionToSqlOrThrow = ({
  expression,
  resolveReference,
}: {
  expression: string;
  resolveReference: FormulaSqlReferenceResolver;
}): FormulaSqlValue => {
  try {
    return compileInstructions({
      instructions: parseExpressionInstructions(expression),
      resolveReference,
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
