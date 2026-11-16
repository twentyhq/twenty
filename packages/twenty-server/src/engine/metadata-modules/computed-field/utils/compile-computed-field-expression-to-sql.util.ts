import { isBoolean, isNumber, isString } from '@sniptt/guards';
import {
  COMPUTED_FIELD_EXPRESSION_MAX_LENGTH,
  EXPRESSION_DATE_PARTS,
  EXPRESSION_DATE_UNITS,
} from 'twenty-shared/constants';
import {
  type ComputedFieldExpressionFunctionName,
  type ComputedFieldExpressionInstruction,
  type ExpressionDatePart,
  type ExpressionDateUnit,
  FieldMetadataType,
} from 'twenty-shared/types';
import {
  assertUnreachable,
  getComputedFieldExpressionInstructions,
  formatExpressionDate,
  isExpressionDateInSupportedRange,
  getExpressionDateLiteralErrorMessage,
  isDefined,
  isExpressionDatePart,
  isExpressionDateUnit,
  parseExpressionDate,
} from 'twenty-shared/utils';

import { ComputedFieldExpressionException } from 'src/engine/metadata-modules/computed-field/exceptions/computed-field.exception';
import { type CompiledComputedFieldExpression } from 'src/engine/metadata-modules/computed-field/types/compiled-computed-field-expression.type';
import { type ComputedFieldValueType } from 'src/engine/metadata-modules/computed-field/types/computed-field-value-type.type';

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

const { NUMBER, TEXT, BOOLEAN, DATE, DATE_TIME } = FieldMetadataType;

const DATE_TYPES: ComputedFieldValueType[] = [DATE, DATE_TIME];

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

// A text literal next to a date is read as a date. A comparison reads a date and a date and time as UTC days, as rules do;
// elsewhere a date is widened to UTC midnight so no time is dropped
const unifyOperands = ({
  operands,
  usage,
  context,
  isComparison = false,
}: {
  operands: ValueOperand[];
  usage: string;
  context: Pick<CompilationContext, 'parameters'>;
  isComparison?: boolean;
}): { sqls: string[]; type: ComputedFieldValueType | undefined } => {
  const fieldType =
    operands.find(
      (operand) =>
        isDefined(operand.type) && !isDefined(operand.textLiteralParameterName),
    )?.type ?? operands.find((operand) => isDefined(operand.type))?.type;

  if (fieldType !== DATE && fieldType !== DATE_TIME) {
    const sqls = operands.map((operand) => {
      if (
        isDefined(fieldType) &&
        isDefined(operand.type) &&
        operand.type !== fieldType
      ) {
        throw new ComputedFieldExpressionException(
          `${usage} cannot combine ${fieldType.toLowerCase()} and ${operand.type.toLowerCase()}`,
        );
      }

      return operand.sql;
    });

    return { sqls, type: fieldType };
  }

  const dateOperands = operands.map((operand) =>
    toDateOperand({ operand, context, usage }),
  );

  const dateTypes = dateOperands
    .filter((_, index) => isDefined(operands[index].type))
    .map((operand) => operand.type);

  const type = isComparison
    ? dateTypes.includes(DATE)
      ? DATE
      : DATE_TIME
    : dateTypes.includes(DATE_TIME)
      ? DATE_TIME
      : DATE;

  return {
    sqls: dateOperands.map((operand) =>
      type === DATE ? toUtcDateSql(operand) : toInstantSql(operand),
    ),
    type,
  };
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
  (
    left: ValueOperand,
    right: ValueOperand,
    operator: string,
    context: CompilationContext,
  ) => {
    const { sqls, type } = unifyOperands({
      operands: [left, right],
      usage: `"${operator}"`,
      context,
      isComparison: true,
    });

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
  (
    left: ValueOperand,
    right: ValueOperand,
    operator: string,
    context: CompilationContext,
  ) => ValueOperand
> = {
  '+': compileArithmetic((left, right) => `(${left} + ${right})`),
  '-': compileArithmetic((left, right) => `(${left} - ${right})`),
  '*': compileArithmetic((left, right) => `(${left} * ${right})`),
  // Integer columns would truncate, and a zero divisor would fail the whole query
  '/': compileArithmetic(
    (left, right) => `(${left}::numeric / NULLIF(${right}, 0))`,
  ),
  // MOD has no float variant, the column type of a NUMBER field
  '%': compileArithmetic(
    (left, right) => `MOD(${left}::numeric, NULLIF(${right}, 0)::numeric)`,
  ),
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
  context: CompilationContext,
): ValueOperand => {
  assertOperandType(condition, [BOOLEAN], `The condition of ${usage}`);

  const { sqls, type } = unifyOperands({
    operands: [whenTrue, whenFalse],
    usage,
    context,
  });

  return value(
    `(CASE WHEN ${condition.sql} THEN ${sqls[0]} ELSE ${sqls[1]} END)`,
    type,
  );
};

const compileSameTypeFunction =
  (sqlFunction: string, allowedTypes?: ComputedFieldValueType[]) =>
  (
    functionArguments: ValueOperand[],
    usage: string,
    context: CompilationContext,
  ) => {
    const { sqls, type } = unifyOperands({
      operands: functionArguments,
      usage,
      context,
    });

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

type CompilationContext = {
  resolveField: (path: string[]) => {
    sql: string;
    type: ComputedFieldValueType | undefined;
  };
  parameters: Record<string, unknown>;
};

type DateOperand = { sql: string; type: typeof DATE | typeof DATE_TIME };

// A text literal is read the way the shared evaluator reads it: a day, or a date and time with an offset
const toDateOperand = ({
  operand,
  context,
  usage,
}: {
  operand: ValueOperand;
  context: Pick<CompilationContext, 'parameters'>;
  usage: string;
}): DateOperand => {
  if (isDefined(operand.textLiteralParameterName)) {
    const text = context.parameters[operand.textLiteralParameterName];
    const expressionDate = parseExpressionDate(text);

    if (
      !isDefined(expressionDate) ||
      !isExpressionDateInSupportedRange(expressionDate)
    ) {
      throw new ComputedFieldExpressionException(
        `${usage} cannot read "${String(text)}" as a date such as '2030-01-31'`,
      );
    }

    // Postgres rejects some forms Temporal reads, such as a [Europe/Paris] annotation, so the parsed value is bound
    context.parameters[operand.textLiteralParameterName] =
      formatExpressionDate(expressionDate);

    return expressionDate.isDateOnly
      ? { sql: `:${operand.textLiteralParameterName}::date`, type: DATE }
      : {
          sql: `:${operand.textLiteralParameterName}::timestamptz`,
          type: DATE_TIME,
        };
  }

  assertOperandType(operand, DATE_TYPES, usage);

  return { sql: operand.sql, type: operand.type === DATE ? DATE : DATE_TIME };
};

// The unit changes the SQL, so it must be written in the expression, not read from a field
const readLiteralOrThrow = <TLiteral extends string>({
  operand,
  context,
  kind,
  allowedValues,
  isAllowedValue,
  usage,
}: {
  operand: ValueOperand;
  context: CompilationContext;
  kind: 'unit' | 'part';
  allowedValues: readonly TLiteral[];
  isAllowedValue: (value: unknown) => value is TLiteral;
  usage: string;
}): TLiteral => {
  if (!isDefined(operand.textLiteralParameterName)) {
    throw new ComputedFieldExpressionException(
      `${usage} needs its ${kind} written as text, such as '${allowedValues[0]}'`,
    );
  }

  const literal = context.parameters[operand.textLiteralParameterName];

  if (!isAllowedValue(literal)) {
    throw new ComputedFieldExpressionException(
      getExpressionDateLiteralErrorMessage({
        value: literal,
        kind,
        allowedValues,
      }),
    );
  }

  return literal;
};

const toUtcDateSql = ({ sql, type }: DateOperand): string =>
  type === DATE ? sql : `(${sql} AT TIME ZONE 'UTC')::date`;

const toInstantSql = ({ sql, type }: DateOperand): string =>
  type === DATE ? `(${sql}::timestamp AT TIME ZONE 'UTC')` : sql;

// Wall-clock time in UTC, so interval arithmetic and truncation ignore the session time zone
const toUtcWallClockSql = ({ sql, type }: DateOperand): string =>
  type === DATE ? `${sql}::timestamp` : `(${sql} AT TIME ZONE 'UTC')`;

// Years 1 to 9999, as isExpressionDateInSupportedRange: from 0001-01-01T00:00:00Z to the last microsecond of 9999
const SUPPORTED_EPOCH_SECONDS_RANGE = '-62135596800 AND 253402300799.999999';
const SUPPORTED_MONTH_INDEX_RANGE = '12 AND 119999';

const SECONDS_BY_DATE_UNIT = {
  MINUTE: 60,
  HOUR: 3600,
  DAY: 86400,
  WEEK: 604800,
};
const MONTHS_BY_DATE_UNIT = { MONTH: 1, QUARTER: 3, YEAR: 12 };

const POSTGRES_DATE_UNIT: Record<ExpressionDateUnit, string> = {
  MINUTE: 'minute',
  HOUR: 'hour',
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year',
};

const POSTGRES_INTERVAL_BY_DATE_UNIT: Record<ExpressionDateUnit, string> = {
  MINUTE: '1 minute',
  HOUR: '1 hour',
  DAY: '1 day',
  WEEK: '1 week',
  MONTH: '1 month',
  QUARTER: '3 months',
  YEAR: '1 year',
};

const POSTGRES_DATE_PART: Record<ExpressionDatePart, string> = {
  YEAR: 'YEAR',
  QUARTER: 'QUARTER',
  MONTH: 'MONTH',
  WEEK: 'WEEK',
  DAY: 'DAY',
  DAY_OF_WEEK: 'ISODOW',
  HOUR: 'HOUR',
  MINUTE: 'MINUTE',
};

const readDateUnitOrThrow = ({
  operand,
  context,
  usage,
}: {
  operand: ValueOperand;
  context: CompilationContext;
  usage: string;
}): ExpressionDateUnit =>
  readLiteralOrThrow({
    operand,
    context,
    kind: 'unit',
    allowedValues: EXPRESSION_DATE_UNITS,
    isAllowedValue: isExpressionDateUnit,
    usage,
  });

// Same rules as the shared evaluator: minutes and hours are elapsed time, longer units count UTC calendar days and months
// Binds each operand once so nested date functions stay linear in size; OFFSET 0 stops Postgres inlining them back
const withBoundOperands = ({
  operands,
  render,
}: {
  operands: Record<string, string>;
  render: (columns: Record<string, string>) => string;
}): string => {
  const alias = '"dateFunctionOperands"';
  const columns = Object.fromEntries(
    Object.keys(operands).map((name) => [name, `${alias}."${name}"`]),
  );
  const selectedOperands = Object.entries(operands)
    .map(([name, sql]) => `${sql} AS "${name}"`)
    .join(', ');

  return `(SELECT ${render(columns)} FROM (SELECT ${selectedOperands} OFFSET 0) AS ${alias})`;
};

const compileDateDiff = (
  [fromOperand, toOperand, unitOperand]: ValueOperand[],
  usage: string,
  context: CompilationContext,
): ValueOperand => {
  const from = toDateOperand({ operand: fromOperand, context, usage });
  const to = toDateOperand({ operand: toOperand, context, usage });
  const unit = readDateUnitOrThrow({ operand: unitOperand, context, usage });

  switch (unit) {
    case 'MINUTE':
    case 'HOUR':
      return value(
        `TRUNC(EXTRACT(EPOCH FROM (${toInstantSql(to)} - ${toInstantSql(from)})) / ${unit === 'MINUTE' ? 60 : 3600})`,
        NUMBER,
      );
    case 'DAY':
      return value(`(${toUtcDateSql(to)} - ${toUtcDateSql(from)})`, NUMBER);
    case 'WEEK':
      return value(
        `TRUNC((${toUtcDateSql(to)} - ${toUtcDateSql(from)}) / 7.0)`,
        NUMBER,
      );
    case 'MONTH':
    case 'QUARTER':
    case 'YEAR': {
      return value(
        withBoundOperands({
          // Without the cast AGE resolves to timestamptz, where a midnight DST change in the session time zone loses a month
          operands: {
            age: `AGE(${toUtcDateSql(to)}::timestamp, ${toUtcDateSql(from)}::timestamp)`,
          },
          render: ({ age }) => {
            const months = `(EXTRACT(YEAR FROM ${age}) * 12 + EXTRACT(MONTH FROM ${age}))`;

            return unit === 'MONTH'
              ? months
              : `TRUNC(${months} / ${unit === 'QUARTER' ? 3 : 12}.0)`;
          },
        }),
        NUMBER,
      );
    }
    default:
      return assertUnreachable(unit);
  }
};

const compileDateAdd = (
  [dateOperand, amountOperand, unitOperand]: ValueOperand[],
  usage: string,
  context: CompilationContext,
): ValueOperand => {
  const date = toDateOperand({ operand: dateOperand, context, usage });
  const unit = readDateUnitOrThrow({ operand: unitOperand, context, usage });

  assertOperandType(amountOperand, [NUMBER], usage);

  const type =
    date.type === DATE && unit !== 'MINUTE' && unit !== 'HOUR'
      ? DATE
      : DATE_TIME;

  const sql = withBoundOperands({
    operands: {
      date: date.sql,
      amount: `TRUNC(${amountOperand.sql}::numeric)`,
    },
    render: (columns) => {
      const boundDate: DateOperand = { sql: columns.date, type: date.type };
      const epochSeconds = `EXTRACT(EPOCH FROM ${boundDate.sql})`;
      const isResultSupported =
        unit === 'MONTH' || unit === 'QUARTER' || unit === 'YEAR'
          ? `(EXTRACT(YEAR FROM ${toUtcDateSql(boundDate)}) * 12 + EXTRACT(MONTH FROM ${toUtcDateSql(boundDate)}) - 1 + ${columns.amount} * ${MONTHS_BY_DATE_UNIT[unit]}) BETWEEN ${SUPPORTED_MONTH_INDEX_RANGE}`
          : `(${epochSeconds} + ${columns.amount} * ${SECONDS_BY_DATE_UNIT[unit]}) BETWEEN ${SUPPORTED_EPOCH_SECONDS_RANGE}`;

      // An out-of-range date fails the whole read, so the amount is nulled first, as the shared evaluator returns null
      const supportedAmount = `CASE WHEN ${epochSeconds} BETWEEN ${SUPPORTED_EPOCH_SECONDS_RANGE} AND ${isResultSupported} THEN ${columns.amount} END`;
      const interval = `(${supportedAmount} * INTERVAL '${POSTGRES_INTERVAL_BY_DATE_UNIT[unit]}')`;

      return type === DATE
        ? `(${boundDate.sql} + ${interval})::date`
        : `((${toUtcWallClockSql(boundDate)} + ${interval}) AT TIME ZONE 'UTC')`;
    },
  });

  return value(sql, type);
};

const compileDateTrunc = (
  [dateOperand, unitOperand]: ValueOperand[],
  usage: string,
  context: CompilationContext,
): ValueOperand => {
  const date = toDateOperand({ operand: dateOperand, context, usage });
  const unit = readDateUnitOrThrow({ operand: unitOperand, context, usage });

  if (
    date.type === DATE &&
    (unit === 'MINUTE' || unit === 'HOUR' || unit === 'DAY')
  ) {
    return value(date.sql, DATE);
  }

  if (date.type === DATE) {
    return value(
      `DATE_TRUNC('${POSTGRES_DATE_UNIT[unit]}', ${date.sql}::timestamp)::date`,
      DATE,
    );
  }

  return value(
    `(DATE_TRUNC('${POSTGRES_DATE_UNIT[unit]}', ${toUtcWallClockSql(date)}) AT TIME ZONE 'UTC')`,
    DATE_TIME,
  );
};

const compileDatePart = (
  [dateOperand, partOperand]: ValueOperand[],
  usage: string,
  context: CompilationContext,
): ValueOperand => {
  const date = toDateOperand({ operand: dateOperand, context, usage });
  const part = readLiteralOrThrow({
    operand: partOperand,
    context,
    kind: 'part',
    allowedValues: EXPRESSION_DATE_PARTS,
    isAllowedValue: isExpressionDatePart,
    usage,
  });

  return value(
    `EXTRACT(${POSTGRES_DATE_PART[part]} FROM ${toUtcWallClockSql(date)})`,
    NUMBER,
  );
};

const FUNCTIONS: Record<
  ComputedFieldExpressionFunctionName,
  {
    minimumArgumentCount: number;
    maximumArgumentCount: number;
    compile: (
      functionArguments: ValueOperand[],
      usage: string,
      context: CompilationContext,
    ) => ValueOperand;
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
  dateDiff: {
    minimumArgumentCount: 3,
    maximumArgumentCount: 3,
    compile: compileDateDiff,
  },
  dateAdd: {
    minimumArgumentCount: 3,
    maximumArgumentCount: 3,
    compile: compileDateAdd,
  },
  dateTrunc: {
    minimumArgumentCount: 2,
    maximumArgumentCount: 2,
    compile: compileDateTrunc,
  },
  datePart: {
    minimumArgumentCount: 2,
    maximumArgumentCount: 2,
    compile: compileDatePart,
  },
};

const isFunctionName = (
  name: string,
): name is ComputedFieldExpressionFunctionName =>
  Object.prototype.hasOwnProperty.call(FUNCTIONS, name);

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
          Object.prototype.hasOwnProperty.call(
            VARIABLE_BY_NAME,
            operand.path[0],
          )
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

          const { sqls } = unifyOperands({
            operands: [left, ...right.items],
            usage: '"in"',
            context,
            isComparison: true,
          });

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

        operands.push(
          compileBinaryOperator(left, toValue(right), name, context),
        );
        break;
      }
      case 'IOP3': {
        if (name !== '?') {
          throw new ComputedFieldExpressionException(
            `Unsupported operator "${name}"`,
          );
        }

        operands.push(compileCondition(popValues(3), '"? :"', context));
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

        operands.push(compile(functionArguments, `"${functionName}"`, context));
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
