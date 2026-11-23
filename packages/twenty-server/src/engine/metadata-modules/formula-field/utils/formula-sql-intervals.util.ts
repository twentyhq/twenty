import { isDefined } from 'twenty-shared/utils';

import { FormulaSqlCompilationException } from 'src/engine/metadata-modules/formula-field/exceptions/formula-sql-compilation.exception';
import { type FormulaSqlValue } from 'src/engine/metadata-modules/formula-field/types/formula-sql-value.type';
import { keepFormulaSqlValueInRange } from 'src/engine/metadata-modules/formula-field/utils/formula-sql-values.util';

type FormulaSqlIntervalUnit = {
  intervalField: string;
  multiplier: number;
  maximumAmount: number;
  truncationField: string;
};

// Larger amounts yield no date, which keeps additions far inside the range Postgres timestamps can hold
const FORMULA_SQL_INTERVAL_UNITS: Partial<
  Record<string, FormulaSqlIntervalUnit>
> = {
  SECOND: {
    intervalField: 'secs',
    multiplier: 1,
    maximumAmount: 2_000_000_000,
    truncationField: 'second',
  },
  MINUTE: {
    intervalField: 'mins',
    multiplier: 1,
    maximumAmount: 2_000_000_000,
    truncationField: 'minute',
  },
  HOUR: {
    intervalField: 'hours',
    multiplier: 1,
    maximumAmount: 87_600_000,
    truncationField: 'hour',
  },
  DAY: {
    intervalField: 'days',
    multiplier: 1,
    maximumAmount: 3_660_000,
    truncationField: 'day',
  },
  WEEK: {
    intervalField: 'weeks',
    multiplier: 1,
    maximumAmount: 520_000,
    truncationField: 'week',
  },
  MONTH: {
    intervalField: 'months',
    multiplier: 1,
    maximumAmount: 120_000,
    truncationField: 'month',
  },
  QUARTER: {
    intervalField: 'months',
    multiplier: 3,
    maximumAmount: 40_000,
    truncationField: 'quarter',
  },
  YEAR: {
    intervalField: 'years',
    multiplier: 1,
    maximumAmount: 10_000,
    truncationField: 'year',
  },
};

export const getFormulaSqlUnitOrThrow = <TUnit extends string>({
  value,
  units,
  usage,
}: {
  value: FormulaSqlValue;
  units: readonly TUnit[];
  usage: string;
}): TUnit => {
  const unit = units.find((candidate) => candidate === value.textLiteral);

  if (!isDefined(unit)) {
    throw new FormulaSqlCompilationException({
      message: `${usage} needs one of ${units.map((candidate) => `"${candidate}"`).join(', ')}`,
    });
  }

  return unit;
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
}): string =>
  `date_trunc('${getIntervalUnitOrThrow(unit).truncationField}', ${timestampSql})`;
