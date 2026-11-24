import { FormulaSqlCompilationException } from 'src/engine/metadata-modules/formula-field/exceptions/formula-sql-compilation.exception';
import { type FormulaSqlValue } from 'src/engine/metadata-modules/formula-field/types/formula-sql-value.type';
import {
  assertFormulaSqlTypeOrThrow,
  describeFormulaSqlType,
  toNumberOperandOrThrow,
  toTextOperandOrThrow,
  unifyFormulaSqlValuesOrThrow,
} from 'src/engine/metadata-modules/formula-field/utils/formula-sql-values.util';

const ARITHMETIC_OPERATORS = ['+', '-', '*', '/', '%'];
const ORDERING_OPERATORS = ['<', '<=', '>', '>='];
const NUMBER_FUNCTION_OPERATORS = ['abs', 'ceil', 'floor', 'trunc'];

export const compileFormulaSqlUnaryOperatorOrThrow = ({
  operator,
  operand,
}: {
  operator: string;
  operand: FormulaSqlValue;
}): FormulaSqlValue => {
  const usage = `"${operator}"`;

  if (operator === 'not') {
    return {
      sql: `(NOT ${assertFormulaSqlTypeOrThrow({ value: operand, type: 'boolean', usage }).sql})`,
      type: 'boolean',
    };
  }

  if (operator === 'length') {
    if (operand.type === 'textArray') {
      return {
        sql: `COALESCE(cardinality(${operand.sql}), 0)::numeric`,
        type: 'number',
      };
    }

    return {
      sql: `char_length(COALESCE(${assertFormulaSqlTypeOrThrow({ value: operand, type: 'text', usage }).sql}, ''))::numeric`,
      type: 'number',
    };
  }

  const number = toNumberOperandOrThrow({ value: operand, usage });

  if (operator === '-') {
    return { sql: `(-${number})`, type: 'number' };
  }

  if (operator === '+') {
    return { sql: number, type: 'number' };
  }

  // Halves round up, as Math.round does
  if (operator === 'round') {
    return { sql: `floor(${number} + 0.5)`, type: 'number' };
  }

  if (NUMBER_FUNCTION_OPERATORS.includes(operator)) {
    return { sql: `${operator}(${number})`, type: 'number' };
  }

  throw new FormulaSqlCompilationException({
    message: `"${operator}" is not supported in a formula`,
  });
};

export const compileFormulaSqlBinaryOperatorOrThrow = ({
  operator,
  left,
  right,
}: {
  operator: string;
  left: FormulaSqlValue;
  right: FormulaSqlValue;
}): FormulaSqlValue => {
  const usage = `"${operator}"`;

  if (ARITHMETIC_OPERATORS.includes(operator)) {
    const leftNumber = toNumberOperandOrThrow({ value: left, usage });
    const rightNumber = toNumberOperandOrThrow({ value: right, usage });

    // A division by zero is empty instead of an error that would fail the whole query
    return {
      sql:
        operator === '/' || operator === '%'
          ? `(${leftNumber} ${operator} NULLIF(${rightNumber}, 0))`
          : `(${leftNumber} ${operator} ${rightNumber})`,
      type: 'number',
    };
  }

  if (operator === 'and' || operator === 'or') {
    const leftCondition = assertFormulaSqlTypeOrThrow({
      value: left,
      type: 'boolean',
      usage,
    });
    const rightCondition = assertFormulaSqlTypeOrThrow({
      value: right,
      type: 'boolean',
      usage,
    });

    return {
      sql: `(${leftCondition.sql} ${operator.toUpperCase()} ${rightCondition.sql})`,
      type: 'boolean',
    };
  }

  if (operator === '==' || operator === '!=') {
    const [unifiedLeft, unifiedRight] = unifyFormulaSqlValuesOrThrow({
      left,
      right,
      usage,
      shouldCompareDatesByDay: true,
    });

    return {
      sql: `(${unifiedLeft.sql} IS ${operator === '==' ? 'NOT ' : ''}DISTINCT FROM ${unifiedRight.sql})`,
      type: 'boolean',
    };
  }

  if (ORDERING_OPERATORS.includes(operator)) {
    const [unifiedLeft, unifiedRight] = unifyFormulaSqlValuesOrThrow({
      left,
      right,
      usage,
      shouldCompareDatesByDay: true,
    });

    if (
      unifiedLeft.type === 'boolean' ||
      unifiedLeft.type === 'textArray' ||
      unifiedLeft.type === 'record'
    ) {
      throw new FormulaSqlCompilationException({
        message: `${usage} cannot order ${describeFormulaSqlType(unifiedLeft.type)}`,
      });
    }

    // Text is ordered by code point, as the validation rule evaluator does, whatever the database collation
    const collation = unifiedLeft.type === 'text' ? ' COLLATE "C"' : '';

    return {
      sql: `COALESCE(${unifiedLeft.sql} ${operator} ${unifiedRight.sql}${collation}, FALSE)`,
      type: 'boolean',
    };
  }

  if (operator === 'in') {
    if (right.type !== 'textArray') {
      throw new FormulaSqlCompilationException({
        message: `"in" needs a list on its right side, but got ${describeFormulaSqlType(right.type)}`,
      });
    }

    return {
      sql: `COALESCE(${assertFormulaSqlTypeOrThrow({ value: left, type: 'text', usage }).sql} = ANY(${right.sql}), FALSE)`,
      type: 'boolean',
    };
  }

  if (operator === '||') {
    if (left.type === 'textArray' && right.type === 'textArray') {
      return {
        sql: `(COALESCE(${left.sql}, '{}') || COALESCE(${right.sql}, '{}'))`,
        type: 'textArray',
      };
    }

    return {
      sql: `(${toTextOperandOrThrow({ value: left, usage })} || ${toTextOperandOrThrow({ value: right, usage })})`,
      type: 'text',
      isNeverNull: true,
    };
  }

  throw new FormulaSqlCompilationException({
    message: `"${operator}" is not supported in a formula`,
  });
};
