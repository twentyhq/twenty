import {
  EXPRESSION_DATE_PARTS,
  EXPRESSION_DATE_UNITS,
  VALIDATION_RULE_FUNCTIONS,
} from 'twenty-shared/constants';
import { type ValidationRuleFunctionName } from 'twenty-shared/types';
import {
  isValidationRuleFunctionName,
  relativeDateFilterDirectionSchema,
  relativeDateFilterUnitSchema,
} from 'twenty-shared/utils';

import { FormulaSqlCompilationException } from 'src/engine/metadata-modules/formula-field/exceptions/formula-sql-compilation.exception';
import { type FormulaSqlValue } from 'src/engine/metadata-modules/formula-field/types/formula-sql-value.type';
import { getFormulaSqlUnitOrThrow } from 'src/engine/metadata-modules/formula-field/utils/get-formula-sql-unit-or-throw.util';
import {
  buildFormulaSqlInterval,
  buildFormulaSqlPeriodStart,
} from 'src/engine/metadata-modules/formula-field/utils/formula-sql-intervals.util';
import {
  assertFormulaSqlTypeOrThrow,
  describeFormulaSqlType,
  fromUtcTimestamp,
  keepFormulaSqlValueInRange,
  toDateLikeValueOrThrow,
  toNumberOperandOrThrow,
  toTextOperandOrThrow,
  toUtcDate,
  toUtcTimestamp,
  unifyFormulaSqlValuesOrThrow,
} from 'src/engine/metadata-modules/formula-field/utils/formula-sql-values.util';

type FormulaSqlFunction = {
  compile: (input: {
    formulaSqlValues: FormulaSqlValue[];
    usage: string;
  }) => FormulaSqlValue;
};

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
  unit: (typeof EXPRESSION_DATE_UNITS)[number];
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
    case 'YEAR':
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

  const isInRange = ({ start, end }: { start: string; end: string }) =>
    `COALESCE(${amountSql} >= 1 AND ${timestamp} >= ${start} AND ${timestamp} < ${end}, FALSE)`;

  if (direction === 'PAST') {
    return isInRange({
      start: `${periodStart} - ${periods}`,
      end: periodStart,
    });
  }

  return isInRange({
    start: `${periodStart} + ${onePeriod}`,
    end: `${periodStart} + ${onePeriod} + ${periods}`,
  });
};

const buildTextCaseFunction = (
  sqlFunctionName: 'lower' | 'upper',
): FormulaSqlFunction => ({
  compile: ({ formulaSqlValues: [text], usage }) => ({
    sql: `${sqlFunctionName}(${assertFormulaSqlTypeOrThrow({ value: text, type: 'text', usage }).sql})`,
    type: 'text',
  }),
});

const buildNumberListFunction = (
  sqlFunctionName: 'LEAST' | 'GREATEST',
): FormulaSqlFunction => ({
  compile: ({ formulaSqlValues, usage }) => ({
    sql: `${sqlFunctionName}(${formulaSqlValues.map((value) => assertFormulaSqlTypeOrThrow({ value, type: 'number', usage }).sql).join(', ')})`,
    type: 'number',
  }),
});

const FORMULA_SQL_FUNCTIONS: Record<
  ValidationRuleFunctionName,
  FormulaSqlFunction
> = {
  isDefined: {
    compile: ({ formulaSqlValues: [value] }) => ({
      sql: `(${value.sql} IS NOT NULL)`,
      type: 'boolean',
    }),
  },
  isEmpty: {
    compile: ({ formulaSqlValues: [value] }) => ({
      sql: compileEmptiness({ value, isEmptyExpected: true }),
      type: 'boolean',
    }),
  },
  isNonEmptyString: {
    compile: ({ formulaSqlValues: [value], usage }) => {
      if (
        value.type !== 'text' &&
        value.type !== 'date' &&
        value.type !== 'dateTime'
      ) {
        throw new FormulaSqlCompilationException({
          message: `${usage} needs text, but got ${describeFormulaSqlType(value.type)}`,
        });
      }

      return {
        sql: compileEmptiness({ value, isEmptyExpected: false }),
        type: 'boolean',
      };
    },
  },
  includes: {
    compile: ({ formulaSqlValues: [container, value], usage }) => {
      const searchedText = assertFormulaSqlTypeOrThrow({
        value,
        type: 'text',
        usage,
      });

      if (container.type === 'textArray') {
        return {
          sql: `COALESCE(${searchedText.sql} = ANY(${container.sql}), FALSE)`,
          type: 'boolean',
        };
      }

      return {
        sql: `COALESCE(strpos(${assertFormulaSqlTypeOrThrow({ value: container, type: 'text', usage }).sql}, ${searchedText.sql}) > 0, FALSE)`,
        type: 'boolean',
      };
    },
  },
  arrayLength: {
    compile: ({ formulaSqlValues: [list], usage }) => ({
      sql: `COALESCE(cardinality(${assertFormulaSqlTypeOrThrow({ value: list, type: 'textArray', usage }).sql}), 0)::numeric`,
      type: 'number',
    }),
  },
  dateDiff: {
    compile: ({ formulaSqlValues: [from, to, unit], usage }) => ({
      sql: compileDateDifference({
        from: toDateLikeValueOrThrow({ value: from, usage }),
        to: toDateLikeValueOrThrow({ value: to, usage }),
        unit: getFormulaSqlUnitOrThrow({
          value: unit,
          units: EXPRESSION_DATE_UNITS,
          usage,
        }),
      }),
      type: 'number',
    }),
  },
  dateAdd: {
    compile: ({ formulaSqlValues: [date, amount, unitValue], usage }) => {
      const dateLikeValue = toDateLikeValueOrThrow({
        value: date,
        usage,
      });
      const unit = getFormulaSqlUnitOrThrow({
        value: unitValue,
        units: EXPRESSION_DATE_UNITS,
        usage,
      });
      const interval = buildFormulaSqlInterval({
        unit,
        amountSql: assertFormulaSqlTypeOrThrow({
          value: amount,
          type: 'number',
          usage,
        }).sql,
      });

      return fromUtcTimestamp({
        timestampSql: `${keepFormulaSqlValueInRange({
          sql: toUtcTimestamp(dateLikeValue),
          minimumSql: `'0001-01-01'::timestamp`,
          maximumSql: `'9999-12-31 23:59:59.999'::timestamp`,
        })} + ${interval}`,
        type:
          dateLikeValue.type === 'date' && unit !== 'MINUTE' && unit !== 'HOUR'
            ? 'date'
            : 'dateTime',
      });
    },
  },
  dateTrunc: {
    compile: ({ formulaSqlValues: [date, unit], usage }) => {
      const dateLikeValue = toDateLikeValueOrThrow({
        value: date,
        usage,
      });

      return fromUtcTimestamp({
        timestampSql: buildFormulaSqlPeriodStart({
          unit: getFormulaSqlUnitOrThrow({
            value: unit,
            units: EXPRESSION_DATE_UNITS,
            usage,
          }),
          timestampSql: toUtcTimestamp(dateLikeValue),
        }),
        type: dateLikeValue.type === 'date' ? 'date' : 'dateTime',
      });
    },
  },
  datePart: {
    compile: ({ formulaSqlValues: [date, part], usage }) => {
      const sqlField =
        DATE_PART_SQL_FIELDS[
          getFormulaSqlUnitOrThrow({
            value: part,
            units: EXPRESSION_DATE_PARTS,
            usage,
          })
        ];

      return {
        sql: `EXTRACT(${sqlField} FROM ${toUtcTimestamp(toDateLikeValueOrThrow({ value: date, usage }))})`,
        type: 'number',
      };
    },
  },
  if: {
    compile: ({
      formulaSqlValues: [condition, valueIfTrue, valueIfFalse],
      usage,
    }) => {
      const [unifiedValueIfTrue, unifiedValueIfFalse] =
        unifyFormulaSqlValuesOrThrow({
          left: valueIfTrue,
          right: valueIfFalse,
          usage,
        });

      return {
        sql: `(CASE WHEN ${assertFormulaSqlTypeOrThrow({ value: condition, type: 'boolean', usage }).sql} THEN ${unifiedValueIfTrue.sql} ELSE ${unifiedValueIfFalse.sql} END)`,
        type: unifiedValueIfTrue.type,
      };
    },
  },
  coalesce: {
    compile: ({ formulaSqlValues, usage }) => {
      const unifiedValues = unifyAll({ formulaSqlValues, usage });

      return {
        sql: `COALESCE(${unifiedValues.map(({ sql }) => sql).join(', ')})`,
        type: unifiedValues[0].type,
      };
    },
  },
  concat: {
    compile: ({ formulaSqlValues, usage }) => ({
      sql: `(${formulaSqlValues
        .map((value) => toTextOperandOrThrow({ value, usage }))
        .join(' || ')})`,
      type: 'text',
      isNeverNull: true,
    }),
  },
  lower: buildTextCaseFunction('lower'),
  upper: buildTextCaseFunction('upper'),
  min: buildNumberListFunction('LEAST'),
  max: buildNumberListFunction('GREATEST'),
  roundTo: {
    compile: ({ formulaSqlValues: [number, decimals], usage }) => ({
      sql: `round(${assertFormulaSqlTypeOrThrow({ value: number, type: 'number', usage }).sql}, LEAST(GREATEST(trunc(${toNumberOperandOrThrow({ value: decimals, usage })}), 0), 20)::integer)`,
      type: 'number',
    }),
  },
  isInRelativeDateRange: {
    compile: ({
      formulaSqlValues: [date, direction, amount, unit],
      usage,
    }) => ({
      sql: compileRelativeDateRange({
        date: toDateLikeValueOrThrow({
          value: date,
          usage,
        }),
        direction: getFormulaSqlUnitOrThrow({
          value: direction,
          units: relativeDateFilterDirectionSchema.options,
          usage,
        }),
        amountSql: assertFormulaSqlTypeOrThrow({
          value: amount,
          type: 'number',
          usage,
        }).sql,
        unit: getFormulaSqlUnitOrThrow({
          value: unit,
          units: relativeDateFilterUnitSchema.options,
          usage,
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
  if (!isValidationRuleFunctionName(name)) {
    throw new FormulaSqlCompilationException({
      message: `Unknown function "${name}"`,
    });
  }

  const { minimumArgumentCount, maximumArgumentCount } =
    VALIDATION_RULE_FUNCTIONS[name];
  const { compile } = FORMULA_SQL_FUNCTIONS[name];

  if (
    formulaSqlValues.length < minimumArgumentCount ||
    formulaSqlValues.length > maximumArgumentCount
  ) {
    throw new FormulaSqlCompilationException({
      message: `${name} takes ${minimumArgumentCount === maximumArgumentCount ? minimumArgumentCount : `at least ${minimumArgumentCount}`} argument(s), but got ${formulaSqlValues.length}`,
    });
  }

  return compile({ formulaSqlValues, usage: name });
};
