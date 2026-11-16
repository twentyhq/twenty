import { isBoolean, isNumber, isString } from '@sniptt/guards';
import {
  assertUnreachable,
  type ComputedFieldExpressionInstruction,
  getComputedFieldExpressionInstructions,
  isDefined,
} from 'twenty-shared/utils';
import {
  COMPUTED_FIELD_EXPRESSION_FUNCTION_NAMES,
  COMPUTED_FIELD_EXPRESSION_MAX_LENGTH,
  type ComputedFieldExpressionFunctionName,
} from 'twenty-shared/constants';

import { ComputedFieldExpressionException } from 'src/engine/metadata-modules/computed-field/exceptions/computed-field.exception';
import { escapeLiteral } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

// An operand is SQL, a field path still being read ("task" then ".status"), or the items of a list literal
type Operand =
  | { kind: 'sql'; sql: string }
  | { kind: 'path'; path: string[] }
  | { kind: 'list'; items: string[] };

const VARIABLE_SQL_BY_NAME: Record<string, string> = {
  now: 'NOW()',
  today: 'CURRENT_DATE',
};

const UNARY_OPERATOR_SQL: Record<string, (operand: string) => string> = {
  '-': (operand) => `(-${operand})`,
  '+': (operand) => operand,
  not: (operand) => `(NOT ${operand})`,
};

const BINARY_OPERATOR_SQL: Record<
  string,
  (left: string, right: string) => string
> = {
  '+': (left, right) => `(${left} + ${right})`,
  '-': (left, right) => `(${left} - ${right})`,
  '*': (left, right) => `(${left} * ${right})`,
  // Integer columns would truncate, and a zero divisor would fail the whole query
  '/': (left, right) => `(${left}::numeric / NULLIF(${right}, 0))`,
  '%': (left, right) => `MOD(${left}, NULLIF(${right}, 0))`,
  '==': (left, right) => `(${left} = ${right})`,
  '!=': (left, right) => `(${left} <> ${right})`,
  '<': (left, right) => `(${left} < ${right})`,
  '<=': (left, right) => `(${left} <= ${right})`,
  '>': (left, right) => `(${left} > ${right})`,
  '>=': (left, right) => `(${left} >= ${right})`,
  and: (left, right) => `(${left} AND ${right})`,
  or: (left, right) => `(${left} OR ${right})`,
  '||': (left, right) => `CONCAT(${left}, ${right})`,
};

const FUNCTION_ARGUMENT_COUNTS: Record<
  ComputedFieldExpressionFunctionName,
  { minimum: number; maximum: number }
> = {
  if: { minimum: 3, maximum: 3 },
  coalesce: { minimum: 1, maximum: Infinity },
  isDefined: { minimum: 1, maximum: 1 },
  isEmpty: { minimum: 1, maximum: 1 },
  min: { minimum: 1, maximum: Infinity },
  max: { minimum: 1, maximum: Infinity },
  round: { minimum: 1, maximum: 2 },
  abs: { minimum: 1, maximum: 1 },
  ceil: { minimum: 1, maximum: 1 },
  floor: { minimum: 1, maximum: 1 },
  trunc: { minimum: 1, maximum: 1 },
  concat: { minimum: 1, maximum: Infinity },
  lower: { minimum: 1, maximum: 1 },
  upper: { minimum: 1, maximum: 1 },
  length: { minimum: 1, maximum: 1 },
  daysBetween: { minimum: 2, maximum: 2 },
  daysSince: { minimum: 1, maximum: 1 },
};

const compileFunctionCall = (
  functionName: ComputedFieldExpressionFunctionName,
  functionArguments: string[],
): string => {
  const [first, second, third] = functionArguments;
  const joinedArguments = functionArguments.join(', ');

  switch (functionName) {
    case 'if':
      return `(CASE WHEN ${first} THEN ${second} ELSE ${third} END)`;
    case 'coalesce':
      return `COALESCE(${joinedArguments})`;
    case 'isDefined':
      return `(${first} IS NOT NULL)`;
    case 'isEmpty':
      return `(COALESCE(${first}::text, '') = '')`;
    case 'min':
      return `LEAST(${joinedArguments})`;
    case 'max':
      return `GREATEST(${joinedArguments})`;
    case 'round':
      return isDefined(second)
        ? `ROUND(${first}::numeric, ${second}::int)`
        : `ROUND(${first}::numeric)`;
    case 'abs':
      return `ABS(${first})`;
    case 'ceil':
      return `CEIL(${first})`;
    case 'floor':
      return `FLOOR(${first})`;
    case 'trunc':
      return `TRUNC(${first})`;
    case 'concat':
      return `CONCAT(${joinedArguments})`;
    case 'lower':
      return `LOWER(${first}::text)`;
    case 'upper':
      return `UPPER(${first}::text)`;
    case 'length':
      return `CHAR_LENGTH(${first}::text)`;
    case 'daysBetween':
      return `(${second}::date - ${first}::date)`;
    case 'daysSince':
      return `(CURRENT_DATE - ${first}::date)`;
    default:
      return assertUnreachable(functionName);
  }
};

const isFunctionName = (
  name: string,
): name is ComputedFieldExpressionFunctionName =>
  (COMPUTED_FIELD_EXPRESSION_FUNCTION_NAMES as readonly string[]).includes(
    name,
  );

const compileLiteral = (value: unknown): string => {
  if (isString(value)) {
    return escapeLiteral(value);
  }

  if (isBoolean(value)) {
    return value ? 'TRUE' : 'FALSE';
  }

  if (isNumber(value) && Number.isFinite(value)) {
    return String(value);
  }

  throw new ComputedFieldExpressionException(
    `Unsupported value "${String(value)}"`,
  );
};

const compileInstructions = ({
  instructions,
  resolveFieldPathSql,
}: {
  instructions: ComputedFieldExpressionInstruction[];
  resolveFieldPathSql: (path: string[]) => string;
}): string => {
  const operands: Operand[] = [];

  const popOperand = (): Operand => {
    const operand = operands.pop();

    if (!isDefined(operand)) {
      throw new ComputedFieldExpressionException('The expression is incomplete');
    }

    return operand;
  };

  const toSql = (operand: Operand): string => {
    switch (operand.kind) {
      case 'sql':
        return operand.sql;
      case 'path':
        return operand.path.length === 1 &&
          isDefined(VARIABLE_SQL_BY_NAME[operand.path[0]])
          ? VARIABLE_SQL_BY_NAME[operand.path[0]]
          : resolveFieldPathSql(operand.path);
      case 'list':
        throw new ComputedFieldExpressionException(
          'A list can only be used after "in"',
        );
      default:
        return assertUnreachable(operand);
    }
  };

  const popSql = (): string => toSql(popOperand());

  const popManySql = (count: number): string[] =>
    Array.from({ length: count }, popSql).reverse();

  for (const { type, value } of instructions) {
    switch (type) {
      case 'INUMBER':
        operands.push({ kind: 'sql', sql: compileLiteral(value) });
        break;
      case 'IVAR':
        operands.push({ kind: 'path', path: [String(value)] });
        break;
      case 'IMEMBER': {
        const operand = popOperand();

        if (operand.kind !== 'path') {
          throw new ComputedFieldExpressionException(
            `".${String(value)}" can only follow a field`,
          );
        }

        operands.push({ kind: 'path', path: [...operand.path, String(value)] });
        break;
      }
      case 'IEXPR':
        operands.push({
          kind: 'sql',
          sql: compileInstructions({
            instructions: value as ComputedFieldExpressionInstruction[],
            resolveFieldPathSql,
          }),
        });
        break;
      case 'IARRAY':
        operands.push({ kind: 'list', items: popManySql(Number(value)) });
        break;
      case 'IOP1': {
        const compileUnaryOperator = UNARY_OPERATOR_SQL[String(value)];

        if (!isDefined(compileUnaryOperator)) {
          throw new ComputedFieldExpressionException(
            `Unsupported operator "${String(value)}"`,
          );
        }

        operands.push({ kind: 'sql', sql: compileUnaryOperator(popSql()) });
        break;
      }
      case 'IOP2': {
        const right = popOperand();
        const left = popSql();

        if (value === 'in') {
          if (right.kind !== 'list' || right.items.length === 0) {
            throw new ComputedFieldExpressionException(
              '"in" must be followed by a non-empty list, such as [1, 2]',
            );
          }

          operands.push({
            kind: 'sql',
            sql: `(${left} IN (${right.items.join(', ')}))`,
          });
          break;
        }

        const compileBinaryOperator = BINARY_OPERATOR_SQL[String(value)];

        if (!isDefined(compileBinaryOperator)) {
          throw new ComputedFieldExpressionException(
            `Unsupported operator "${String(value)}"`,
          );
        }

        operands.push({
          kind: 'sql',
          sql: compileBinaryOperator(left, toSql(right)),
        });
        break;
      }
      case 'IOP3': {
        const [condition, whenTrue, whenFalse] = popManySql(3);

        if (value !== '?') {
          throw new ComputedFieldExpressionException(
            `Unsupported operator "${String(value)}"`,
          );
        }

        operands.push({
          kind: 'sql',
          sql: compileFunctionCall('if', [condition, whenTrue, whenFalse]),
        });
        break;
      }
      case 'IFUNCALL': {
        const functionArguments = popManySql(Number(value));
        const functionOperand = popOperand();
        const functionName =
          functionOperand.kind === 'path' ? functionOperand.path.join('.') : '';

        if (!isFunctionName(functionName)) {
          throw new ComputedFieldExpressionException(
            `Unknown function "${functionName}"`,
          );
        }

        const { minimum, maximum } = FUNCTION_ARGUMENT_COUNTS[functionName];

        if (
          functionArguments.length < minimum ||
          functionArguments.length > maximum
        ) {
          throw new ComputedFieldExpressionException(
            `"${functionName}" does not take ${functionArguments.length} argument(s)`,
          );
        }

        operands.push({
          kind: 'sql',
          sql: compileFunctionCall(functionName, functionArguments),
        });
        break;
      }
      default:
        throw new ComputedFieldExpressionException(
          `Unsupported syntax (${type})`,
        );
    }
  }

  const sql = popSql();

  if (operands.length > 0) {
    throw new ComputedFieldExpressionException('The expression is incomplete');
  }

  return sql;
};

export const compileComputedFieldExpressionToSql = ({
  expression,
  resolveFieldPathSql,
}: {
  expression: string;
  resolveFieldPathSql: (path: string[]) => string;
}): string => {
  if (expression.trim().length === 0) {
    throw new ComputedFieldExpressionException('The expression is empty');
  }

  if (expression.length > COMPUTED_FIELD_EXPRESSION_MAX_LENGTH) {
    throw new ComputedFieldExpressionException(
      `The expression is longer than ${COMPUTED_FIELD_EXPRESSION_MAX_LENGTH} characters`,
    );
  }

  let instructions: ComputedFieldExpressionInstruction[];

  try {
    instructions = getComputedFieldExpressionInstructions(expression);
  } catch (error) {
    throw new ComputedFieldExpressionException(
      error instanceof Error ? error.message : 'The expression cannot be read',
    );
  }

  return compileInstructions({ instructions, resolveFieldPathSql });
};
