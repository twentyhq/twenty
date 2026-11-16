import {
  type ExpressionDatePart,
  type ExpressionDateUnit,
  FieldMetadataType,
  type TypedComputedFieldExpressionNode,
} from 'twenty-shared/types';
import {
  assertUnreachable,
  isDefined,
  isExpressionDatePart,
  isExpressionDateUnit,
} from 'twenty-shared/utils';

import { type ComputedFieldDateSqlOperand } from 'src/engine/metadata-modules/computed-field/types/computed-field-date-sql-operand.type';
import { type ComputedFieldExpressionFunctionSqlRenderer } from 'src/engine/metadata-modules/computed-field/types/computed-field-expression-function-sql-renderer.type';
import { toComputedFieldInstantSql } from 'src/engine/metadata-modules/computed-field/utils/to-computed-field-instant-sql.util';
import { toComputedFieldUtcDateSql } from 'src/engine/metadata-modules/computed-field/utils/to-computed-field-utc-date-sql.util';
import { toComputedFieldUtcWallClockSql } from 'src/engine/metadata-modules/computed-field/utils/to-computed-field-utc-wall-clock-sql.util';
import { withComputedFieldBoundOperandsSql } from 'src/engine/metadata-modules/computed-field/utils/with-computed-field-bound-operands-sql.util';

const { DATE, DATE_TIME } = FieldMetadataType;

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

// The type check has already read the unit or part, so the literal is syntax and never bound
const readLiteralOrThrow = <TLiteral extends string>(
  node: TypedComputedFieldExpressionNode | undefined,
  isAllowedValue: (value: unknown) => value is TLiteral,
): TLiteral => {
  if (node?.kind !== 'textLiteral' || !isAllowedValue(node.value)) {
    throw new Error('A date unit or part must be a checked text literal');
  }

  return node.value;
};

const toDateSqlOperand = (
  node: TypedComputedFieldExpressionNode | undefined,
  emitSql: (node: TypedComputedFieldExpressionNode) => string,
): ComputedFieldDateSqlOperand => {
  if (!isDefined(node)) {
    throw new Error('A date function is missing a date argument');
  }

  return { sql: emitSql(node), type: node.type === DATE ? DATE : DATE_TIME };
};

const renderDateDiff: ComputedFieldExpressionFunctionSqlRenderer = ({
  functionArguments: [fromNode, toNode, unitNode],
  emitSql,
}) => {
  const from = toDateSqlOperand(fromNode, emitSql);
  const to = toDateSqlOperand(toNode, emitSql);
  const unit = readLiteralOrThrow(unitNode, isExpressionDateUnit);

  switch (unit) {
    case 'MINUTE':
    case 'HOUR':
      return `TRUNC(EXTRACT(EPOCH FROM (${toComputedFieldInstantSql(to)} - ${toComputedFieldInstantSql(from)})) / ${unit === 'MINUTE' ? 60 : 3600})`;
    case 'DAY':
      return `(${toComputedFieldUtcDateSql(to)} - ${toComputedFieldUtcDateSql(from)})`;
    case 'WEEK':
      return `TRUNC((${toComputedFieldUtcDateSql(to)} - ${toComputedFieldUtcDateSql(from)}) / 7.0)`;
    case 'MONTH':
    case 'QUARTER':
    case 'YEAR':
      return withComputedFieldBoundOperandsSql({
        // Without the cast AGE resolves to timestamptz, where a midnight DST change in the session time zone loses a month
        operands: {
          age: `AGE(${toComputedFieldUtcDateSql(to)}::timestamp, ${toComputedFieldUtcDateSql(from)}::timestamp)`,
        },
        render: ({ age }) => {
          const months = `(EXTRACT(YEAR FROM ${age}) * 12 + EXTRACT(MONTH FROM ${age}))`;

          return unit === 'MONTH'
            ? months
            : `TRUNC(${months} / ${unit === 'QUARTER' ? 3 : 12}.0)`;
        },
      });
    default:
      return assertUnreachable(unit);
  }
};

const renderDateAdd: ComputedFieldExpressionFunctionSqlRenderer = ({
  functionArguments: [dateNode, amountNode, unitNode],
  emitSql,
}) => {
  const date = toDateSqlOperand(dateNode, emitSql);
  const unit = readLiteralOrThrow(unitNode, isExpressionDateUnit);

  if (!isDefined(amountNode)) {
    throw new Error('dateAdd is missing its amount');
  }

  return withComputedFieldBoundOperandsSql({
    operands: {
      date: date.sql,
      amount: `TRUNC(${emitSql(amountNode)}::numeric)`,
    },
    render: (columns) => {
      const boundDate = { sql: columns.date, type: date.type };
      const epochSeconds = `EXTRACT(EPOCH FROM ${boundDate.sql})`;
      const isResultSupported =
        unit === 'MONTH' || unit === 'QUARTER' || unit === 'YEAR'
          ? `(EXTRACT(YEAR FROM ${toComputedFieldUtcDateSql(boundDate)}) * 12 + EXTRACT(MONTH FROM ${toComputedFieldUtcDateSql(boundDate)}) - 1 + ${columns.amount} * ${MONTHS_BY_DATE_UNIT[unit]}) BETWEEN ${SUPPORTED_MONTH_INDEX_RANGE}`
          : `(${epochSeconds} + ${columns.amount} * ${SECONDS_BY_DATE_UNIT[unit]}) BETWEEN ${SUPPORTED_EPOCH_SECONDS_RANGE}`;

      // An out-of-range date fails the whole read, so the amount is nulled first, as the shared evaluator returns null
      const supportedAmount = `CASE WHEN ${epochSeconds} BETWEEN ${SUPPORTED_EPOCH_SECONDS_RANGE} AND ${isResultSupported} THEN ${columns.amount} END`;
      const interval = `(${supportedAmount} * INTERVAL '${POSTGRES_INTERVAL_BY_DATE_UNIT[unit]}')`;

      return date.type === DATE && unit !== 'MINUTE' && unit !== 'HOUR'
        ? `(${boundDate.sql} + ${interval})::date`
        : `((${toComputedFieldUtcWallClockSql(boundDate)} + ${interval}) AT TIME ZONE 'UTC')`;
    },
  });
};

const renderDateTrunc: ComputedFieldExpressionFunctionSqlRenderer = ({
  functionArguments: [dateNode, unitNode],
  emitSql,
}) => {
  const date = toDateSqlOperand(dateNode, emitSql);
  const unit = readLiteralOrThrow(unitNode, isExpressionDateUnit);

  if (date.type === DATE) {
    return unit === 'MINUTE' || unit === 'HOUR' || unit === 'DAY'
      ? date.sql
      : `DATE_TRUNC('${POSTGRES_DATE_UNIT[unit]}', ${date.sql}::timestamp)::date`;
  }

  return `(DATE_TRUNC('${POSTGRES_DATE_UNIT[unit]}', ${toComputedFieldUtcWallClockSql(date)}) AT TIME ZONE 'UTC')`;
};

const renderDatePart: ComputedFieldExpressionFunctionSqlRenderer = ({
  functionArguments: [dateNode, partNode],
  emitSql,
}) =>
  `EXTRACT(${POSTGRES_DATE_PART[readLiteralOrThrow(partNode, isExpressionDatePart)]} FROM ${toComputedFieldUtcWallClockSql(toDateSqlOperand(dateNode, emitSql))})`;

export const COMPUTED_FIELD_EXPRESSION_DATE_FUNCTION_SQL = {
  dateDiff: renderDateDiff,
  dateAdd: renderDateAdd,
  dateTrunc: renderDateTrunc,
  datePart: renderDatePart,
};
