import {
  EXPRESSION_DATE_PARTS,
  EXPRESSION_DATE_UNITS,
} from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { FormulaSqlCompilationException } from 'src/engine/metadata-modules/formula-field/exceptions/formula-sql-compilation.exception';
import { type FormulaSqlValue } from 'src/engine/metadata-modules/formula-field/types/formula-sql-value.type';
import {
  buildFormulaSqlInterval,
  buildFormulaSqlPeriodStart,
  getFormulaSqlUnitOrThrow,
} from 'src/engine/metadata-modules/formula-field/utils/formula-sql-intervals.util';
import {
  assertFormulaSqlTypeOrThrow,
  describeFormulaSqlType,
  fromUtcTimestamp,
  toDateLikeValueOrThrow,
  toNumberOperandOrThrow,
  toTextOperandOrThrow,
  toUtcDate,
  toUtcTimestamp,
  unifyFormulaSqlValuesOrThrow,
} from 'src/engine/metadata-modules/formula-field/utils/formula-sql-values.util';

type FormulaSqlFunction = {
  minimumArgumentCount: number;
  maximumArgumentCount: number;
  compile: (formulaSqlValues: FormulaSqlValue[]) => FormulaSqlValue;
};

const RELATIVE_DATE_DIRECTIONS = ['PAST', 'NEXT', 'THIS'];
const RELATIVE_DATE_UNITS = ['SECOND', ...EXPRESSION_DATE_UNITS];
const DATE_PART_SQL_FIELDS: Record<
  (typeof EXPRESSION_DATE_PARTS)[number],
  string
> = {
  YEAR: 'YEAR',
  QUARTER: 'QUARTER',
  MONTH: 'MONTH',
  WEEK: 'WEEK',
  DAY: 'DAY',
  DAY_OF_WEEK: 'ISODOW',
  HOUR: 'HOUR',
  MINUTE: 'MINUTE',
};
const NOW_UTC_TIMESTAMP = `(NOW() AT TIME ZONE 'UTC')`;

const unifyAll = ({
  formulaSqlValues,
  usage,
}: {
  formulaSqlValues: FormulaSqlValue[];
  usage: string;
}): FormulaSqlValue[] => {
  const [firstValue, ...otherValues] = formulaSqlValues;
  const target = otherValues.reduce(
    (unifiedValue, value) =>
      unifyFormulaSqlValuesOrThrow({
        left: unifiedValue,
        right: value,
        usage,
      })[0],
    firstValue,
  );

  return formulaSqlValues.map(
    (value) =>
      unifyFormulaSqlValuesOrThrow({ left: value, right: target, usage })[0],
  );
};

const compileEmptiness = ({
  value,
  isEmptyExpected,
}: {
  value: FormulaSqlValue;
  isEmptyExpected: boolean;
}): string => {
  const comparison = isEmptyExpected ? '=' : '<>';

  if (value.type === 'text') {
    return `(COALESCE(${value.sql}, '') ${comparison} '')`;
  }

  if (value.type === 'textArray') {
    return `(COALESCE(cardinality(${value.sql}), 0) ${comparison} 0)`;
  }

  return `(${value.sql} IS ${isEmptyExpected ? '' : 'NOT '}NULL)`;
};

const compileCalendarMonthDifference = ({
  from,
  to,
}: {
  from: FormulaSqlValue;
  to: FormulaSqlValue;
}): { years: string; months: string } => {
  const age = `age(${toUtcDate(to)}::timestamp, ${toUtcDate(from)}::timestamp)`;

  return {
    years: `EXTRACT(YEAR FROM ${age})`,
    months: `(EXTRACT(YEAR FROM ${age}) * 12 + EXTRACT(MONTH FROM ${age}))`,
  };
};

const compileDateDifference = ({
  from,
  to,
  unit,
}: {
  from: FormulaSqlValue;
  to: FormulaSqlValue;
  unit: string;
}): string => {
  switch (unit) {
    case 'MINUTE':
    case 'HOUR':
      return `trunc(EXTRACT(EPOCH FROM (${toUtcTimestamp(to)} - ${toUtcTimestamp(from)})) / ${unit === 'MINUTE' ? 60 : 3600})`;
    case 'DAY':
      return `(${toUtcDate(to)} - ${toUtcDate(from)})::numeric`;
    case 'WEEK':
      return `trunc((${toUtcDate(to)} - ${toUtcDate(from)})::numeric / 7)`;
    case 'MONTH':
      return compileCalendarMonthDifference({ from, to }).months;
    case 'QUARTER':
      return `trunc(${compileCalendarMonthDifference({ from, to }).months} / 3)`;
    default:
      return compileCalendarMonthDifference({ from, to }).years;
  }
};

const compileRelativeDateRange = ({
  date,
  direction,
  amountSql,
  unit,
}: {
  date: FormulaSqlValue;
  direction: string;
  amountSql: string;
  unit: string;
}): string => {
  const timestamp = toUtcTimestamp(date);
  const periodStart = buildFormulaSqlPeriodStart({
    unit,
    timestampSql: NOW_UTC_TIMESTAMP,
  });
  const onePeriod = buildFormulaSqlInterval({ unit, amountSql: '1' });
  const periods = buildFormulaSqlInterval({ unit, amountSql });

  if (direction === 'THIS') {
    return `COALESCE(${timestamp} >= ${periodStart} AND ${timestamp} < ${periodStart} + ${onePeriod}, FALSE)`;
  }

  const [start, end] =
    direction === 'PAST'
      ? [`${periodStart} - ${periods}`, periodStart]
      : [
          `${periodStart} + ${onePeriod}`,
          `${periodStart} + ${onePeriod} + ${periods}`,
        ];

  return `COALESCE(${amountSql} >= 1 AND ${timestamp} >= ${start} AND ${timestamp} < ${end}, FALSE)`;
};

const FORMULA_SQL_FUNCTIONS: Partial<Record<string, FormulaSqlFunction>> = {
  isDefined: {
    minimumArgumentCount: 1,
    maximumArgumentCount: 1,
    compile: ([value]) => ({
      sql: `(${value.sql} IS NOT NULL)`,
      type: 'boolean',
    }),
  },
  isEmpty: {
    minimumArgumentCount: 1,
    maximumArgumentCount: 1,
    compile: ([value]) => ({
      sql: compileEmptiness({ value, isEmptyExpected: true }),
      type: 'boolean',
    }),
  },
  isNonEmptyString: {
    minimumArgumentCount: 1,
    maximumArgumentCount: 1,
    compile: ([value]) => {
      if (
        value.type !== 'text' &&
        value.type !== 'date' &&
        value.type !== 'dateTime'
      ) {
        throw new FormulaSqlCompilationException({
          message: `isNonEmptyString needs text, but got ${describeFormulaSqlType(value.type)}`,
        });
      }

      return {
        sql: compileEmptiness({ value, isEmptyExpected: false }),
        type: 'boolean',
      };
    },
  },
  includes: {
    minimumArgumentCount: 2,
    maximumArgumentCount: 2,
    compile: ([container, value]) => {
      const searchedText = assertFormulaSqlTypeOrThrow({
        value,
        type: 'text',
        usage: 'includes',
      });

      if (container.type === 'textArray') {
        return {
          sql: `COALESCE(${searchedText.sql} = ANY(${container.sql}), FALSE)`,
          type: 'boolean',
        };
      }

      return {
        sql: `COALESCE(strpos(${assertFormulaSqlTypeOrThrow({ value: container, type: 'text', usage: 'includes' }).sql}, ${searchedText.sql}) > 0, FALSE)`,
        type: 'boolean',
      };
    },
  },
  arrayLength: {
    minimumArgumentCount: 1,
    maximumArgumentCount: 1,
    compile: ([list]) => ({
      sql: `COALESCE(cardinality(${assertFormulaSqlTypeOrThrow({ value: list, type: 'textArray', usage: 'arrayLength' }).sql}), 0)::numeric`,
      type: 'number',
    }),
  },
  dateDiff: {
    minimumArgumentCount: 3,
    maximumArgumentCount: 3,
    compile: ([from, to, unit]) => ({
      sql: compileDateDifference({
        from: toDateLikeValueOrThrow({ value: from, usage: 'dateDiff' }),
        to: toDateLikeValueOrThrow({ value: to, usage: 'dateDiff' }),
        unit: getFormulaSqlUnitOrThrow({
          value: unit,
          units: EXPRESSION_DATE_UNITS,
          usage: 'dateDiff',
        }),
      }),
      type: 'number',
    }),
  },
  dateAdd: {
    minimumArgumentCount: 3,
    maximumArgumentCount: 3,
    compile: ([date, amount, unitValue]) => {
      const dateLikeValue = toDateLikeValueOrThrow({
        value: date,
        usage: 'dateAdd',
      });
      const unit = getFormulaSqlUnitOrThrow({
        value: unitValue,
        units: EXPRESSION_DATE_UNITS,
        usage: 'dateAdd',
      });
      const interval = buildFormulaSqlInterval({
        unit,
        amountSql: assertFormulaSqlTypeOrThrow({
          value: amount,
          type: 'number',
          usage: 'dateAdd',
        }).sql,
      });

      return fromUtcTimestamp({
        timestampSql: `${toUtcTimestamp(dateLikeValue)} + ${interval}`,
        type:
          dateLikeValue.type === 'date' && unit !== 'MINUTE' && unit !== 'HOUR'
            ? 'date'
            : 'dateTime',
      });
    },
  },
  dateTrunc: {
    minimumArgumentCount: 2,
    maximumArgumentCount: 2,
    compile: ([date, unit]) => {
      const dateLikeValue = toDateLikeValueOrThrow({
        value: date,
        usage: 'dateTrunc',
      });

      return fromUtcTimestamp({
        timestampSql: buildFormulaSqlPeriodStart({
          unit: getFormulaSqlUnitOrThrow({
            value: unit,
            units: EXPRESSION_DATE_UNITS,
            usage: 'dateTrunc',
          }),
          timestampSql: toUtcTimestamp(dateLikeValue),
        }),
        type: dateLikeValue.type === 'date' ? 'date' : 'dateTime',
      });
    },
  },
  datePart: {
    minimumArgumentCount: 2,
    maximumArgumentCount: 2,
    compile: ([date, part]) => {
      const sqlField =
        DATE_PART_SQL_FIELDS[
          getFormulaSqlUnitOrThrow({
            value: part,
            units: EXPRESSION_DATE_PARTS,
            usage: 'datePart',
          })
        ];

      return {
        sql: `EXTRACT(${sqlField} FROM ${toUtcTimestamp(toDateLikeValueOrThrow({ value: date, usage: 'datePart' }))})`,
        type: 'number',
      };
    },
  },
  if: {
    minimumArgumentCount: 3,
    maximumArgumentCount: 3,
    compile: ([condition, valueIfTrue, valueIfFalse]) => {
      const [unifiedValueIfTrue, unifiedValueIfFalse] =
        unifyFormulaSqlValuesOrThrow({
          left: valueIfTrue,
          right: valueIfFalse,
          usage: 'if',
        });

      return {
        sql: `(CASE WHEN ${assertFormulaSqlTypeOrThrow({ value: condition, type: 'boolean', usage: 'if' }).sql} THEN ${unifiedValueIfTrue.sql} ELSE ${unifiedValueIfFalse.sql} END)`,
        type: unifiedValueIfTrue.type,
      };
    },
  },
  coalesce: {
    minimumArgumentCount: 1,
    maximumArgumentCount: Infinity,
    compile: (formulaSqlValues) => {
      const unifiedValues = unifyAll({ formulaSqlValues, usage: 'coalesce' });

      return {
        sql: `COALESCE(${unifiedValues.map(({ sql }) => sql).join(', ')})`,
        type: unifiedValues[0].type,
      };
    },
  },
  concat: {
    minimumArgumentCount: 1,
    maximumArgumentCount: Infinity,
    compile: (formulaSqlValues) => ({
      sql: `(${formulaSqlValues
        .map((value) => toTextOperandOrThrow({ value, usage: 'concat' }))
        .join(' || ')})`,
      type: 'text',
      isNeverNull: true,
    }),
  },
  lower: {
    minimumArgumentCount: 1,
    maximumArgumentCount: 1,
    compile: ([text]) => ({
      sql: `lower(${assertFormulaSqlTypeOrThrow({ value: text, type: 'text', usage: 'lower' }).sql})`,
      type: 'text',
    }),
  },
  upper: {
    minimumArgumentCount: 1,
    maximumArgumentCount: 1,
    compile: ([text]) => ({
      sql: `upper(${assertFormulaSqlTypeOrThrow({ value: text, type: 'text', usage: 'upper' }).sql})`,
      type: 'text',
    }),
  },
  min: {
    minimumArgumentCount: 1,
    maximumArgumentCount: Infinity,
    compile: (formulaSqlValues) => ({
      sql: `LEAST(${formulaSqlValues.map((value) => assertFormulaSqlTypeOrThrow({ value, type: 'number', usage: 'min' }).sql).join(', ')})`,
      type: 'number',
    }),
  },
  max: {
    minimumArgumentCount: 1,
    maximumArgumentCount: Infinity,
    compile: (formulaSqlValues) => ({
      sql: `GREATEST(${formulaSqlValues.map((value) => assertFormulaSqlTypeOrThrow({ value, type: 'number', usage: 'max' }).sql).join(', ')})`,
      type: 'number',
    }),
  },
  roundTo: {
    minimumArgumentCount: 2,
    maximumArgumentCount: 2,
    compile: ([number, decimals]) => ({
      sql: `round(${assertFormulaSqlTypeOrThrow({ value: number, type: 'number', usage: 'roundTo' }).sql}, LEAST(GREATEST(trunc(${toNumberOperandOrThrow({ value: decimals, usage: 'roundTo' })}), 0), 20)::integer)`,
      type: 'number',
    }),
  },
  isInRelativeDateRange: {
    minimumArgumentCount: 4,
    maximumArgumentCount: 4,
    compile: ([date, direction, amount, unit]) => ({
      sql: compileRelativeDateRange({
        date: toDateLikeValueOrThrow({
          value: date,
          usage: 'isInRelativeDateRange',
        }),
        direction: getFormulaSqlUnitOrThrow({
          value: direction,
          units: RELATIVE_DATE_DIRECTIONS,
          usage: 'isInRelativeDateRange',
        }),
        amountSql: assertFormulaSqlTypeOrThrow({
          value: amount,
          type: 'number',
          usage: 'isInRelativeDateRange',
        }).sql,
        unit: getFormulaSqlUnitOrThrow({
          value: unit,
          units: RELATIVE_DATE_UNITS,
          usage: 'isInRelativeDateRange',
        }),
      }),
      type: 'boolean',
    }),
  },
};

export const compileFormulaSqlFunctionOrThrow = ({
  name,
  formulaSqlValues,
}: {
  name: string;
  formulaSqlValues: FormulaSqlValue[];
}): FormulaSqlValue => {
  const formulaSqlFunction = FORMULA_SQL_FUNCTIONS[name];

  if (!isDefined(formulaSqlFunction)) {
    throw new FormulaSqlCompilationException({
      message: `Unknown function "${name}"`,
    });
  }

  const { minimumArgumentCount, maximumArgumentCount, compile } =
    formulaSqlFunction;

  if (
    formulaSqlValues.length < minimumArgumentCount ||
    formulaSqlValues.length > maximumArgumentCount
  ) {
    throw new FormulaSqlCompilationException({
      message: `${name} takes ${minimumArgumentCount === maximumArgumentCount ? minimumArgumentCount : `at least ${minimumArgumentCount}`} argument(s), but got ${formulaSqlValues.length}`,
    });
  }

  return compile(formulaSqlValues);
};
