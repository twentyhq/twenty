import { isDefined } from 'twenty-shared/utils';

import { FormulaSqlCompilationException } from 'src/engine/metadata-modules/formula-field/exceptions/formula-sql-compilation.exception';
import { keepFormulaSqlValueInRange } from 'src/engine/metadata-modules/formula-field/utils/formula-sql-values.util';

type FormulaSqlIntervalUnit = {
  intervalField: string;
  multiplier: number;
  maximumAmount: number;
};

// About 4,000 years at most, so a date of years 0001-9999 moved by any allowed amount stays after 4713 BC, the earliest timestamp Postgres holds
const FORMULA_SQL_INTERVAL_UNITS: Partial<
  Record<string, FormulaSqlIntervalUnit>
> = {
  SECOND: {
    intervalField: 'secs',
    multiplier: 1,
    maximumAmount: 2_000_000_000,
  },
  MINUTE: {
    intervalField: 'mins',
    multiplier: 1,
    maximumAmount: 2_000_000_000,
  },
  HOUR: {
    intervalField: 'hours',
    multiplier: 1,
    maximumAmount: 35_000_000,
  },
  DAY: {
    intervalField: 'days',
    multiplier: 1,
    maximumAmount: 1_460_000,
  },
  WEEK: {
    intervalField: 'weeks',
    multiplier: 1,
    maximumAmount: 208_000,
  },
  MONTH: {
    intervalField: 'months',
    multiplier: 1,
    maximumAmount: 48_000,
  },
  QUARTER: {
    intervalField: 'months',
    multiplier: 3,
    maximumAmount: 16_000,
  },
  YEAR: {
    intervalField: 'years',
    multiplier: 1,
    maximumAmount: 4_000,
  },
};

const getIntervalUnitOrThrow = (unit: string): FormulaSqlIntervalUnit => {
  const intervalUnit = FORMULA_SQL_INTERVAL_UNITS[unit];

  if (!isDefined(intervalUnit)) {
    throw new FormulaSqlCompilationException({
      message: `Unknown date unit "${unit}"`,
    });
  }

  return intervalUnit;
};

export const buildFormulaSqlInterval = ({
  unit,
  amountSql,
}: {
  unit: string;
  amountSql: string;
}): string => {
  const { intervalField, multiplier, maximumAmount } =
    getIntervalUnitOrThrow(unit);
  const amount = keepFormulaSqlValueInRange({
    sql: `trunc(${amountSql})`,
    minimumSql: `-${maximumAmount}`,
    maximumSql: `${maximumAmount}`,
  });

  return `make_interval(${intervalField} => (${amount} * ${multiplier})::integer)`;
};

export const buildFormulaSqlPeriodStart = ({
  unit,
  timestampSql,
}: {
  unit: string;
  timestampSql: string;
}): string => {
  getIntervalUnitOrThrow(unit);

  return `date_trunc('${unit.toLowerCase()}', ${timestampSql})`;
};
