import { VALIDATION_RULE_FUNCTIONS } from 'twenty-shared/constants';
import { FieldMetadataType } from 'twenty-shared/types';

import { compileComputedFieldExpressionToSql } from 'src/engine/metadata-modules/computed-field/utils/compile-computed-field-expression-to-sql.util';

type DateFunctionName = 'dateDiff' | 'dateAdd' | 'dateTrunc' | 'datePart';

type ParityCase = [DateFunctionName, (string | number)[], string | number];

// Each case runs through the shared evaluator and through Postgres, and both must give the expected value
const PARITY_CASES: ParityCase[] = [
  [
    'dateDiff',
    ['2026-09-23T10:00:00.000Z', '2026-09-23T11:29:59.000Z', 'MINUTE'],
    89,
  ],
  [
    'dateDiff',
    ['2026-09-23T10:00:00.000Z', '2026-09-23T11:29:59.000Z', 'HOUR'],
    1,
  ],
  [
    'dateDiff',
    ['2026-09-23T10:30:00.000Z', '2026-09-23T10:00:00.000Z', 'HOUR'],
    0,
  ],
  [
    'dateDiff',
    ['2026-09-23T11:29:59.000Z', '2026-09-23T10:00:00.000Z', 'HOUR'],
    -1,
  ],
  ['dateDiff', ['2026-09-23', '2026-09-23T02:30:00.000Z', 'MINUTE'], 150],
  [
    'dateDiff',
    ['2026-09-23T23:59:00.000Z', '2026-09-24T00:01:00.000Z', 'DAY'],
    1,
  ],
  ['dateDiff', ['2026-09-23T10:41:00+02:00', '2026-09-23', 'DAY'], 0],
  ['dateDiff', ['2026-09-23', '2026-09-30', 'WEEK'], 1],
  ['dateDiff', ['2026-09-30', '2026-09-24', 'WEEK'], 0],
  ['dateDiff', ['2026-09-30', '2026-09-23', 'WEEK'], -1],
  ['dateDiff', ['2026-01-31', '2026-02-28', 'MONTH'], 0],
  ['dateDiff', ['2026-01-31', '2026-03-01', 'MONTH'], 1],
  ['dateDiff', ['2026-03-01', '2026-01-31', 'MONTH'], -1],
  ['dateDiff', ['2026-03-31', '2026-01-31', 'MONTH'], -2],
  ['dateDiff', ['2026-01-15', '2026-07-15', 'QUARTER'], 2],
  ['dateDiff', ['2024-02-29', '2025-02-28', 'YEAR'], 0],
  ['dateDiff', ['2025-09-23', '2026-09-23T00:00:00.000Z', 'YEAR'], 1],
  ['dateAdd', ['2026-09-23', 3, 'DAY'], '2026-09-26'],
  ['dateAdd', ['2026-09-23', -1, 'WEEK'], '2026-09-16'],
  ['dateAdd', ['2026-01-31', 1, 'MONTH'], '2026-02-28'],
  ['dateAdd', ['2026-01-31', 1, 'QUARTER'], '2026-04-30'],
  ['dateAdd', ['2024-02-29', 1, 'YEAR'], '2025-02-28'],
  ['dateAdd', ['2026-09-23', 90, 'MINUTE'], '2026-09-23T01:30:00.000Z'],
  [
    'dateAdd',
    ['2026-09-23T22:00:00.000Z', 4, 'HOUR'],
    '2026-09-24T02:00:00.000Z',
  ],
  [
    'dateAdd',
    ['2026-03-28T22:00:00.000Z', 1, 'DAY'],
    '2026-03-29T22:00:00.000Z',
  ],
  [
    'dateAdd',
    ['2026-01-31T09:15:00.000Z', 1, 'MONTH'],
    '2026-02-28T09:15:00.000Z',
  ],
  [
    'dateAdd',
    ['2026-09-23T22:00:00.000Z', 2.9, 'DAY'],
    '2026-09-25T22:00:00.000Z',
  ],
  [
    'dateAdd',
    ['2026-09-23T22:00:00.000Z', -2.9, 'DAY'],
    '2026-09-21T22:00:00.000Z',
  ],
  [
    'dateTrunc',
    ['2026-09-23T10:41:59.123Z', 'MINUTE'],
    '2026-09-23T10:41:00.000Z',
  ],
  [
    'dateTrunc',
    ['2026-09-23T10:41:59.123Z', 'HOUR'],
    '2026-09-23T10:00:00.000Z',
  ],
  [
    'dateTrunc',
    ['2026-09-23T10:41:59.123Z', 'DAY'],
    '2026-09-23T00:00:00.000Z',
  ],
  [
    'dateTrunc',
    ['2026-09-23T10:41:59.123Z', 'WEEK'],
    '2026-09-21T00:00:00.000Z',
  ],
  [
    'dateTrunc',
    ['2026-09-23T00:30:00+02:00', 'DAY'],
    '2026-09-22T00:00:00.000Z',
  ],
  ['dateTrunc', ['2026-09-27', 'WEEK'], '2026-09-21'],
  ['dateTrunc', ['2026-09-23', 'QUARTER'], '2026-07-01'],
  [
    'dateTrunc',
    ['2026-09-23T10:41:59.123Z', 'YEAR'],
    '2026-01-01T00:00:00.000Z',
  ],
  ['dateTrunc', ['2026-09-23', 'HOUR'], '2026-09-23'],
  ['datePart', ['2026-09-23T10:41:00.000Z', 'YEAR'], 2026],
  ['datePart', ['2026-09-23T10:41:00.000Z', 'QUARTER'], 3],
  ['datePart', ['2026-09-23T10:41:00.000Z', 'MONTH'], 9],
  ['datePart', ['2026-09-23T10:41:00.000Z', 'DAY'], 23],
  ['datePart', ['2026-09-27', 'DAY_OF_WEEK'], 7],
  ['datePart', ['2026-09-23T10:41:00.000Z', 'HOUR'], 10],
  ['datePart', ['2026-09-23T10:41:00.000Z', 'MINUTE'], 41],
  ['datePart', ['2026-09-23', 'HOUR'], 0],
  ['datePart', ['2027-01-01', 'WEEK'], 53],
  ['datePart', ['2026-09-23T10:41:00+02:00', 'HOUR'], 8],
];

const toExpressionLiteral = (argument: string | number) =>
  typeof argument === 'number' ? String(argument) : `'${argument}'`;

// Formats in SQL so the comparison does not depend on how the driver parses dates
const toComparableSelect = (sql: string, type: string | undefined) => {
  switch (type) {
    case FieldMetadataType.DATE:
      return `to_char(${sql}, 'YYYY-MM-DD')`;
    case FieldMetadataType.DATE_TIME:
      return `to_char(${sql} AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`;
    default:
      return `(${sql})::float8`;
  }
};

const evaluateInPostgres = async (expression: string) => {
  const { sql, type, parameters } = compileComputedFieldExpressionToSql({
    expression,
    resolveField: () => {
      throw new Error('Parity cases only use literals');
    },
  });

  const [query, values] =
    globalThis.testDataSource.driver.escapeQueryWithParameters(
      `SELECT ${toComparableSelect(sql, type)} AS "value"`,
      parameters,
      {},
    );

  const [row] = await globalThis.testDataSource.query(query, values);

  return row.value;
};

describe('date functions: shared evaluator and Postgres agree', () => {
  it.each(PARITY_CASES)(
    '%s(%j) is %j',
    async (functionName, functionArguments, expected) => {
      const evaluate = VALIDATION_RULE_FUNCTIONS[functionName].evaluate as (
        ...evaluateArguments: unknown[]
      ) => unknown;

      expect(evaluate(...functionArguments)).toBe(expected);

      expect(
        await evaluateInPostgres(
          `${functionName}(${functionArguments.map(toExpressionLiteral).join(', ')})`,
        ),
      ).toBe(expected);
    },
  );
});
