import { isDefined, parseExpressionDate } from 'twenty-shared/utils';

import { escapeLiteral } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { FormulaSqlCompilationException } from 'src/engine/metadata-modules/formula-field/exceptions/formula-sql-compilation.exception';
import {
  type FormulaSqlType,
  type FormulaSqlValue,
} from 'src/engine/metadata-modules/formula-field/types/formula-sql-value.type';

const FORMULA_SQL_TYPE_LABELS: Record<FormulaSqlType, string> = {
  number: 'a number',
  text: 'text',
  boolean: 'true or false',
  date: 'a date',
  dateTime: 'a date and time',
  textArray: 'a list',
  record: 'a record',
};

export const describeFormulaSqlType = (type: FormulaSqlType): string =>
  FORMULA_SQL_TYPE_LABELS[type];

export const buildTextLiteralValueOrThrow = (text: string): FormulaSqlValue => {
  if (text.includes('\u0000')) {
    throw new FormulaSqlCompilationException({
      message: 'Text cannot contain a null character',
    });
  }

  return {
    sql: `${escapeLiteral(text)}::text`,
    type: 'text',
    isNeverNull: true,
    textLiteral: text,
  };
};

export const assertFormulaSqlTypeOrThrow = ({
  value,
  type,
  usage,
}: {
  value: FormulaSqlValue;
  type: FormulaSqlType;
  usage: string;
}): FormulaSqlValue => {
  if (value.type !== type) {
    throw new FormulaSqlCompilationException({
      message: `${usage} needs ${describeFormulaSqlType(type)}, but got ${describeFormulaSqlType(value.type)}`,
    });
  }

  return value;
};

// Arithmetic reads an empty number as 0, as the validation rule evaluator does
export const toNumberOperandOrThrow = ({
  value,
  usage,
}: {
  value: FormulaSqlValue;
  usage: string;
}): string => {
  const { sql, isNeverNull } = assertFormulaSqlTypeOrThrow({
    value,
    type: 'number',
    usage,
  });

  return isNeverNull ? sql : `COALESCE(${sql}, 0)`;
};

// Concatenation reads an empty value as empty text
export const toTextOperandOrThrow = ({
  value,
  usage,
}: {
  value: FormulaSqlValue;
  usage: string;
}): string => {
  const textSql = toTextSqlOrThrow({ value, usage });

  return value.isNeverNull || value.type === 'boolean'
    ? textSql
    : `COALESCE(${textSql}, '')`;
};

// NULL outside the range, so a later cast or addition cannot raise on a row and fail the whole query
export const keepFormulaSqlValueInRange = ({
  sql,
  minimumSql,
  maximumSql,
}: {
  sql: string;
  minimumSql: string;
  maximumSql: string;
}): string =>
  `(CASE WHEN ${sql} BETWEEN ${minimumSql} AND ${maximumSql} THEN ${sql} END)`;

// numeric holds magnitudes double precision cannot, and casting one raises
export const toDoublePrecision = (numberSql: string): string =>
  `(CASE WHEN abs(${numberSql}) < 1e-300 THEN 0 WHEN abs(${numberSql}) <= 1e300 THEN ${numberSql} END)::double precision`;

const isDateValue = ({ type }: Pick<FormulaSqlValue, 'type'>): boolean =>
  type === 'date' || type === 'dateTime';

export const toDateLikeValue = (
  value: FormulaSqlValue,
): FormulaSqlValue | undefined => {
  if (isDateValue(value)) {
    return value;
  }

  const expressionDate = isDefined(value.textLiteral)
    ? parseExpressionDate(value.textLiteral)
    : null;

  if (!isDefined(expressionDate)) {
    return undefined;
  }

  const year = expressionDate.isDateOnly
    ? expressionDate.date.year
    : expressionDate.dateTime.withTimeZone('UTC').year;

  // Postgres has no year zero, so its date casts reject what Temporal accepts
  if (year < 1 || year > 9999) {
    return undefined;
  }

  if (expressionDate.isDateOnly) {
    return {
      sql: `${escapeLiteral(expressionDate.date.toString())}::date`,
      type: 'date',
    };
  }

  return {
    sql: `${escapeLiteral(expressionDate.dateTime.toInstant().toString())}::timestamptz`,
    type: 'dateTime',
  };
};

export const toDateLikeValueOrThrow = ({
  value,
  usage,
}: {
  value: FormulaSqlValue;
  usage: string;
}): FormulaSqlValue => {
  const dateLikeValue = toDateLikeValue(value);

  if (!isDefined(dateLikeValue)) {
    throw new FormulaSqlCompilationException({
      message: `${usage} needs a date, but got ${describeFormulaSqlType(value.type)}`,
    });
  }

  return dateLikeValue;
};

export const toUtcTimestamp = (
  value: Pick<FormulaSqlValue, 'sql' | 'type'>,
): string =>
  value.type === 'date'
    ? `(${value.sql})::timestamp`
    : `((${value.sql}) AT TIME ZONE 'UTC')`;

export const toUtcDate = (
  value: Pick<FormulaSqlValue, 'sql' | 'type'>,
): string =>
  value.type === 'date' ? `(${value.sql})` : `${toUtcTimestamp(value)}::date`;

export const fromUtcTimestamp = ({
  timestampSql,
  type,
}: {
  timestampSql: string;
  type: 'date' | 'dateTime';
}): FormulaSqlValue =>
  type === 'date'
    ? { sql: `(${timestampSql})::date`, type }
    : { sql: `((${timestampSql}) AT TIME ZONE 'UTC')`, type };

export const toDateTimeValue = (value: FormulaSqlValue): FormulaSqlValue =>
  value.type === 'date'
    ? fromUtcTimestamp({
        timestampSql: toUtcTimestamp(value),
        type: 'dateTime',
      })
    : value;

export const toTextSqlOrThrow = ({
  value,
  usage,
}: {
  value: FormulaSqlValue;
  usage: string;
}): string => {
  switch (value.type) {
    case 'text':
      return value.sql;
    case 'number':
      return `(${toDoublePrecision(value.sql)})::text`;
    case 'boolean':
      return `(CASE WHEN ${value.sql} THEN 'true' ELSE 'false' END)`;
    case 'date':
      return `to_char(${value.sql}, 'YYYY-MM-DD')`;
    case 'dateTime':
      return `to_char(${toUtcTimestamp(value)}, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`;
    default:
      throw new FormulaSqlCompilationException({
        message: `${usage} cannot turn ${describeFormulaSqlType(value.type)} into text`,
      });
  }
};

export const unifyFormulaSqlValuesOrThrow = ({
  left,
  right,
  usage,
  shouldCompareDatesByDay = false,
}: {
  left: FormulaSqlValue;
  right: FormulaSqlValue;
  usage: string;
  shouldCompareDatesByDay?: boolean;
}): [FormulaSqlValue, FormulaSqlValue] => {
  const unifiedLeft =
    (isDateValue(right) ? toDateLikeValue(left) : undefined) ?? left;
  const unifiedRight =
    (isDateValue(left) ? toDateLikeValue(right) : undefined) ?? right;

  if (unifiedLeft.type === unifiedRight.type) {
    return [unifiedLeft, unifiedRight];
  }

  if (isDateValue(unifiedLeft) && isDateValue(unifiedRight)) {
    return shouldCompareDatesByDay
      ? [
          { sql: toUtcDate(unifiedLeft), type: 'date' },
          { sql: toUtcDate(unifiedRight), type: 'date' },
        ]
      : [toDateTimeValue(unifiedLeft), toDateTimeValue(unifiedRight)];
  }

  throw new FormulaSqlCompilationException({
    message: `${usage} cannot mix ${describeFormulaSqlType(left.type)} and ${describeFormulaSqlType(right.type)}`,
  });
};
