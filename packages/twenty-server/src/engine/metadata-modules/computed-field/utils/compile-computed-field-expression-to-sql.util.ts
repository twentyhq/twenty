import { isBoolean, isNumber, isString } from '@sniptt/guards';
import {
  COMPUTED_FIELD_EXPRESSION_MAX_LENGTH,
  type ComputedFieldExpressionFunctionName,
} from 'twenty-shared/constants';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  assertUnreachable,
  type ComputedFieldExpressionInstruction,
  getComputedFieldExpressionInstructions,
  isDefined,
} from 'twenty-shared/utils';

import { ComputedFieldExpressionException } from 'src/engine/metadata-modules/computed-field/exceptions/computed-field.exception';
import { type ComputedFieldValueType } from 'src/engine/metadata-modules/computed-field/types/computed-field-value-type.type';
import { type SqlWithParameters } from 'src/engine/metadata-modules/computed-field/types/sql-with-parameters.type';

// `type` is undefined when it cannot be known, as for a value the reader is not allowed to see.
// A text literal keeps its parameter so it can be compared to a date as a date.
type ValueOperand = {
  kind: 'value';
  sql: string;
  type: ComputedFieldValueType | undefined;
  textLiteralParameterName?: string;
};

type Operand =
  | ValueOperand
  | { kind: 'path'; path: string[] }
  | { kind: 'list'; items: ValueOperand[] };

export type CompiledComputedFieldExpression = SqlWithParameters & {
  type: ComputedFieldValueType | undefined;
};

const { NUMBER, TEXT, BOOLEAN, DATE, DATE_TIME } = FieldMetadataType;

const DATE_TYPES: ComputedFieldValueType[] = [DATE, DATE_TIME];

const DATE_SQL_TYPE = { [DATE]: 'date', [DATE_TIME]: 'timestamptz' };

const VARIABLE_BY_NAME: Record<string, ValueOperand> = {
  now: { kind: 'value', sql: 'NOW()', type: DATE_TIME },
  // The database's time zone is a deployment detail, so the day is the UTC one
  today: {
    kind: 'value',
    sql: "(NOW() AT TIME ZONE 'UTC')::date",
    type: DATE,
  },
};

const value = (
  sql: string,
  type: ComputedFieldValueType | undefined,
): ValueOperand => ({ kind: 'value', sql, type });

const assertOperandType = (
  operand: ValueOperand,
  allowedTypes: ComputedFieldValueType[],
  usage: string,
): void => {
  if (isDefined(operand.type) && !allowedTypes.includes(operand.type)) {
    throw new ComputedFieldExpressionException(
      `${usage} expects ${allowedTypes.join(' or ').toLowerCase()}, not ${operand.type.toLowerCase()}`,
    );
  }
};

// Brings operands to one type: a text literal next to a date is read as a date, and a date compares with a date and time
const unifyOperands = (
  operands: ValueOperand[],
  usage: string,
): { sqls: string[]; type: ComputedFieldValueType | undefined } => {
  const type =
    operands.find(
      (operand) =>
        isDefined(operand.type) && !isDefined(operand.textLiteralParameterName),
    )?.type ?? operands.find((operand) => isDefined(operand.type))?.type;

  const sqls = operands.map((operand) => {
    if (
      isDefined(operand.textLiteralParameterName) &&
      (type === DATE || type === DATE_TIME)
    ) {
      return `:${operand.textLiteralParameterName}::${DATE_SQL_TYPE[type]}`;
    }

    if (
      isDefined(type) &&
      isDefined(operand.type) &&
      operand.type !== type &&
      !(DATE_TYPES.includes(type) && DATE_TYPES.includes(operand.type))
    ) {
      throw new ComputedFieldExpressionException(
        `${usage} cannot combine ${type.toLowerCase()} and ${operand.type.toLowerCase()}`,
      );
    }

    return operand.sql;
  });

  return { sqls, type };
};

const compileArithmetic =
  (render: (left: string, right: string) => string) =>
  (left: ValueOperand, right: ValueOperand, operator: string) => {
    assertOperandType(left, [NUMBER], `"${operator}"`);
    assertOperandType(right, [NUMBER], `"${operator}"`);

    return value(render(left.sql, right.sql), NUMBER);
  };

const compileComparison =
  (sqlOperator: string, comparableTypes?: ComputedFieldValueType[]) =>
  (left: ValueOperand, right: ValueOperand, operator: string) => {
    const { sqls, type } = unifyOperands([left, right], `"${operator}"`);

    if (isDefined(comparableTypes) && isDefined(type)) {
      assertOperandType(value('', type), comparableTypes, `"${operator}"`);
    }

    return value(`(${sqls[0]} ${sqlOperator} ${sqls[1]})`, BOOLEAN);
  };

const compileLogical =
  (sqlOperator: string) =>
  (left: ValueOperand, right: ValueOperand, operator: string) => {
    assertOperandType(left, [BOOLEAN], `"${operator}"`);
    assertOperandType(right, [BOOLEAN], `"${operator}"`);

    return value(`(${left.sql} ${sqlOperator} ${right.sql})`, BOOLEAN);
  };

const ORDERED_TYPES: ComputedFieldValueType[] = [NUMBER, TEXT, DATE, DATE_TIME];

const BINARY_OPERATORS: Record<
  string,
  (left: ValueOperand, right: ValueOperand, operator: string) => ValueOperand
> = {
  '+': compileArithmetic((left, right) => `(${left} + ${right})`),
  '-': compileArithmetic((left, right) => `(${left} - ${right})`),
  '*': compileArithmetic((left, right) => `(${left} * ${right})`),
  // Integer columns would truncate, and a zero divisor would fail the whole query
  '/': compileArithmetic(
    (left, right) => `(${left}::numeric / NULLIF(${right}, 0))`,
  ),
  '%': compileArithmetic((left, right) => `MOD(${left}, NULLIF(${right}, 0))`),
  '==': compileComparison('='),
  // "<>" is null, so false, for a record whose value is missing
  '!=': compileComparison('IS DISTINCT FROM'),
  '<': compileComparison('<', ORDERED_TYPES),
  '<=': compileComparison('<=', ORDERED_TYPES),
  '>': compileComparison('>', ORDERED_TYPES),
  '>=': compileComparison('>=', ORDERED_TYPES),
  and: compileLogical('AND'),
  or: compileLogical('OR'),
  '||': (left, right) => value(`CONCAT(${left.sql}, ${right.sql})`, TEXT),
};

const compileCondition = (
  [condition, whenTrue, whenFalse]: ValueOperand[],
  usage: string,
): ValueOperand => {
  assertOperandType(condition, [BOOLEAN], `The condition of ${usage}`);

  const { sqls, type } = unifyOperands([whenTrue, whenFalse], usage);

  return value(
    `(CASE WHEN ${condition.sql} THEN ${sqls[0]} ELSE ${sqls[1]} END)`,
    type,
  );
};

const compileSameTypeFunction =
  (sqlFunction: string, allowedTypes?: ComputedFieldValueType[]) =>
  (functionArguments: ValueOperand[], usage: string) => {
    const { sqls, type } = unifyOperands(functionArguments, usage);

    if (isDefined(allowedTypes) && isDefined(type)) {
      assertOperandType(value('', type), allowedTypes, usage);
    }

    return value(`${sqlFunction}(${sqls.join(', ')})`, type);
  };

const compileNumberFunction =
  (render: (functionArguments: string[]) => string) =>
  (functionArguments: ValueOperand[], usage: string) => {
    for (const functionArgument of functionArguments) {
      assertOperandType(functionArgument, [NUMBER], usage);
    }

    return value(render(functionArguments.map(({ sql }) => sql)), NUMBER);
  };

const compileTextFunction =
  (render: (text: string) => string, type: ComputedFieldValueType) =>
  ([text]: ValueOperand[], usage: string) => {
    assertOperandType(text, [TEXT], usage);

    return value(render(text.sql), type);
  };

const compileDayCount =
  (render: (dates: string[]) => string) =>
  (functionArguments: ValueOperand[], usage: string) =>
    value(
      render(
        functionArguments.map(
          (functionArgument) =>
            `${unifyOperands([value('', DATE), functionArgument], usage).sqls[1]}::date`,
        ),
      ),
      NUMBER,
    );

const FUNCTIONS: Record<
  ComputedFieldExpressionFunctionName,
  {
    minimumArgumentCount: number;
    maximumArgumentCount: number;
    compile: (functionArguments: ValueOperand[], usage: string) => ValueOperand;
  }
> = {
  if: {
    minimumArgumentCount: 3,
    maximumArgumentCount: 3,
    compile: compileCondition,
  },
  coalesce: {
    minimumArgumentCount: 1,
    maximumArgumentCount: Infinity,
    compile: compileSameTypeFunction('COALESCE'),
  },
  isDefined: {
    minimumArgumentCount: 1,
    maximumArgumentCount: 1,
    compile: ([operand]) => value(`(${operand.sql} IS NOT NULL)`, BOOLEAN),
  },
  isEmpty: {
    minimumArgumentCount: 1,
    maximumArgumentCount: 1,
    compile: ([operand]) =>
      value(`(COALESCE(${operand.sql}::text, '') = '')`, BOOLEAN),
  },
  min: {
    minimumArgumentCount: 1,
    maximumArgumentCount: Infinity,
    compile: compileSameTypeFunction('LEAST', ORDERED_TYPES),
  },
  max: {
    minimumArgumentCount: 1,
    maximumArgumentCount: Infinity,
    compile: compileSameTypeFunction('GREATEST', ORDERED_TYPES),
  },
  round: {
    minimumArgumentCount: 1,
    maximumArgumentCount: 2,
    compile: compileNumberFunction(([number, precision]) =>
      isDefined(precision)
        ? `ROUND(${number}::numeric, ${precision}::int)`
        : `ROUND(${number}::numeric)`,
    ),
  },
  abs: {
    minimumArgumentCount: 1,
    maximumArgumentCount: 1,
    compile: compileNumberFunction(([number]) => `ABS(${number})`),
  },
  ceil: {
    minimumArgumentCount: 1,
    maximumArgumentCount: 1,
    compile: compileNumberFunction(([number]) => `CEIL(${number})`),
  },
  floor: {
    minimumArgumentCount: 1,
    maximumArgumentCount: 1,
    compile: compileNumberFunction(([number]) => `FLOOR(${number})`),
  },
  trunc: {
    minimumArgumentCount: 1,
    maximumArgumentCount: 1,
    compile: compileNumberFunction(([number]) => `TRUNC(${number})`),
  },
  concat: {
    minimumArgumentCount: 1,
    maximumArgumentCount: Infinity,
    compile: (functionArguments) =>
      value(
        `CONCAT(${functionArguments.map(({ sql }) => sql).join(', ')})`,
        TEXT,
      ),
  },
  lower: {
    minimumArgumentCount: 1,
    maximumArgumentCount: 1,
    compile: compileTextFunction((text) => `LOWER(${text})`, TEXT),
  },
  upper: {
    minimumArgumentCount: 1,
    maximumArgumentCount: 1,
    compile: compileTextFunction((text) => `UPPER(${text})`, TEXT),
  },
  length: {
    minimumArgumentCount: 1,
    maximumArgumentCount: 1,
    compile: compileTextFunction((text) => `CHAR_LENGTH(${text})`, NUMBER),
  },
  daysBetween: {
    minimumArgumentCount: 2,
    maximumArgumentCount: 2,
    compile: compileDayCount(([from, to]) => `(${to} - ${from})`),
  },
  daysSince: {
    minimumArgumentCount: 1,
    maximumArgumentCount: 1,
    compile: compileDayCount(
      ([from]) => `(${VARIABLE_BY_NAME.today.sql} - ${from})`,
    ),
  },
};

const isFunctionName = (
  name: string,
): name is ComputedFieldExpressionFunctionName =>
  Object.prototype.hasOwnProperty.call(FUNCTIONS, name);

type CompilationContext = {
  resolveField: (path: string[]) => {
    sql: string;
    type: ComputedFieldValueType | undefined;
  };
  parameters: Record<string, unknown>;
};

const compileLiteral = (
  literal: unknown,
  context: CompilationContext,
): ValueOperand => {
  if (isString(literal)) {
    const textLiteralParameterName = `text${Object.keys(context.parameters).length}`;

    context.parameters[textLiteralParameterName] = literal;

    return {
      ...value(`:${textLiteralParameterName}::text`, TEXT),
      textLiteralParameterName,
    };
  }

  if (isBoolean(literal)) {
    return value(literal ? 'TRUE' : 'FALSE', BOOLEAN);
  }

  if (isNumber(literal) && Number.isFinite(literal)) {
    return value(String(literal), NUMBER);
  }

  throw new ComputedFieldExpressionException(
    `Unsupported value "${String(literal)}"`,
  );
};

const compileInstructions = (
  instructions: ComputedFieldExpressionInstruction[],
  context: CompilationContext,
): ValueOperand => {
  const operands: Operand[] = [];

  const popOperand = (): Operand => {
    const operand = operands.pop();

    if (!isDefined(operand)) {
      throw new ComputedFieldExpressionException(
        'The expression is incomplete',
      );
    }

    return operand;
  };

  const toValue = (operand: Operand): ValueOperand => {
    switch (operand.kind) {
      case 'value':
        return operand;
      case 'path':
        return operand.path.length === 1 &&
          isDefined(VARIABLE_BY_NAME[operand.path[0]])
          ? VARIABLE_BY_NAME[operand.path[0]]
          : { kind: 'value', ...context.resolveField(operand.path) };
      case 'list':
        throw new ComputedFieldExpressionException(
          'A list can only be used after "in"',
        );
      default:
        return assertUnreachable(operand);
    }
  };

  const popValue = (): ValueOperand => toValue(popOperand());

  const popValues = (count: number): ValueOperand[] =>
    Array.from({ length: count }, popValue).reverse();

  for (const { type, value: instructionValue } of instructions) {
    const name = String(instructionValue);

    switch (type) {
      case 'INUMBER':
        operands.push(compileLiteral(instructionValue, context));
        break;
      case 'IVAR':
        operands.push({ kind: 'path', path: [name] });
        break;
      case 'IMEMBER': {
        const operand = popOperand();

        if (operand.kind !== 'path') {
          throw new ComputedFieldExpressionException(
            `".${name}" can only follow a field`,
          );
        }

        operands.push({ kind: 'path', path: [...operand.path, name] });
        break;
      }
      case 'IEXPR':
        operands.push(
          compileInstructions(
            instructionValue as ComputedFieldExpressionInstruction[],
            context,
          ),
        );
        break;
      case 'IARRAY':
        operands.push({
          kind: 'list',
          items: popValues(Number(instructionValue)),
        });
        break;
      case 'IOP1': {
        const operand = popValue();

        if (name === 'not') {
          assertOperandType(operand, [BOOLEAN], '"not"');
          operands.push(value(`(NOT ${operand.sql})`, BOOLEAN));
          break;
        }

        if (name !== '-' && name !== '+') {
          throw new ComputedFieldExpressionException(
            `Unsupported operator "${name}"`,
          );
        }

        assertOperandType(operand, [NUMBER], `"${name}"`);
        operands.push(
          value(name === '-' ? `(-${operand.sql})` : operand.sql, NUMBER),
        );
        break;
      }
      case 'IOP2': {
        const right = popOperand();
        const left = popValue();

        if (name === 'in') {
          if (right.kind !== 'list' || right.items.length === 0) {
            throw new ComputedFieldExpressionException(
              '"in" must be followed by a non-empty list, such as [1, 2]',
            );
          }

          const { sqls } = unifyOperands([left, ...right.items], '"in"');

          operands.push(
            value(`(${sqls[0]} IN (${sqls.slice(1).join(', ')}))`, BOOLEAN),
          );
          break;
        }

        const compileBinaryOperator = BINARY_OPERATORS[name];

        if (!isDefined(compileBinaryOperator)) {
          throw new ComputedFieldExpressionException(
            `Unsupported operator "${name}"`,
          );
        }

        operands.push(compileBinaryOperator(left, toValue(right), name));
        break;
      }
      case 'IOP3': {
        if (name !== '?') {
          throw new ComputedFieldExpressionException(
            `Unsupported operator "${name}"`,
          );
        }

        operands.push(compileCondition(popValues(3), '"? :"'));
        break;
      }
      case 'IFUNCALL': {
        const functionArguments = popValues(Number(instructionValue));
        const functionOperand = popOperand();
        const functionName =
          functionOperand.kind === 'path' ? functionOperand.path.join('.') : '';

        if (!isFunctionName(functionName)) {
          throw new ComputedFieldExpressionException(
            `Unknown function "${functionName}"`,
          );
        }

        const { minimumArgumentCount, maximumArgumentCount, compile } =
          FUNCTIONS[functionName];

        if (
          functionArguments.length < minimumArgumentCount ||
          functionArguments.length > maximumArgumentCount
        ) {
          throw new ComputedFieldExpressionException(
            `"${functionName}" does not take ${functionArguments.length} argument(s)`,
          );
        }

        operands.push(compile(functionArguments, `"${functionName}"`));
        break;
      }
      default:
        throw new ComputedFieldExpressionException(
          `Unsupported syntax (${type})`,
        );
    }
  }

  const result = popValue();

  if (operands.length > 0) {
    throw new ComputedFieldExpressionException('The expression is incomplete');
  }

  return result;
};

// Text values travel as parameters; numbers and booleans are written from typed literals
export const compileComputedFieldExpressionToSql = ({
  expression,
  resolveField,
}: {
  expression: string;
  resolveField: CompilationContext['resolveField'];
}): CompiledComputedFieldExpression => {
  if (!isString(expression) || expression.trim().length === 0) {
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

  const context: CompilationContext = { resolveField, parameters: {} };
  const { sql, type } = compileInstructions(instructions, context);

  return { sql, type, parameters: context.parameters };
};
