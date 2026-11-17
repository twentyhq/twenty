import { VALIDATION_RULE_FUNCTIONS } from 'twenty-shared/constants';
import { FieldMetadataType } from 'twenty-shared/types';
import { evaluateValidationRuleExpression } from 'twenty-shared/utils';

import { compileComputedFieldExpressionToSql } from 'src/engine/metadata-modules/computed-field/utils/compile-computed-field-expression-to-sql.util';

type DateFunctionName = 'dateDiff' | 'dateAdd' | 'dateTrunc' | 'datePart';

const EVALUATOR_BY_FUNCTION_NAME: Record<
  DateFunctionName,
  (...functionArguments: (string | number)[]) => unknown
> = {
  dateDiff: VALIDATION_RULE_FUNCTIONS.dateDiff.evaluate,
  dateAdd: VALIDATION_RULE_FUNCTIONS.dateAdd.evaluate,
  dateTrunc: VALIDATION_RULE_FUNCTIONS.dateTrunc.evaluate,
  datePart: VALIDATION_RULE_FUNCTIONS.datePart.evaluate,
};

type ParityCase = [
  DateFunctionName,
  (string | number)[],
  string | number | null,
];

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
  ['dateDiff', ['2026-09-06', '2026-10-06', 'MONTH'], 1],
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
  [
    'dateAdd',
    ['2026-01-01T00:00:00.000Z', 3000000000, 'MINUTE'],
    '7729-12-22T08:00:00.000Z',
  ],
  ['dateAdd', ['2026-01-01', 1000000000000, 'DAY'], null],
  ['dateAdd', ['2026-01-01T00:00:00.000Z', 1000000000000, 'DAY'], null],
  ['dateAdd', ['2026-01-01', 300000, 'YEAR'], null],
  ['dateAdd', ['9999-12-31', 1, 'DAY'], null],
  ['dateAdd', ['9999-12-31', 0, 'DAY'], '9999-12-31'],
  ['dateAdd', ['9998-12-31', 1, 'YEAR'], '9999-12-31'],
  ['dateAdd', ['9999-12-01', 1, 'MONTH'], null],
  ['dateAdd', ['0001-01-01T00:00:00.000Z', -1, 'MINUTE'], null],
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
  ['datePart', ['2026-09-23T10:41:00+02:00[Europe/Paris]', 'HOUR'], 8],
];

const toExpressionLiteral = (argument: string | number) =>
  typeof argument === 'number' ? String(argument) : `'${argument}'`;

// Formats in SQL so the comparison does not depend on how the driver parses dates
const toComparableSelect = ({
  sql,
  type,
}: {
  sql: string;
  type: string | undefined;
}) => {
  switch (type) {
    case FieldMetadataType.DATE:
      return `to_char(${sql}, 'YYYY-MM-DD')`;
    case FieldMetadataType.DATE_TIME:
      return `to_char(${sql} AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`;
    default:
      return `(${sql})::float8`;
  }
};

const queryInSessionTimeZone = async ({
  query,
  parameters,
  sessionTimeZone,
}: {
  query: string;
  parameters: Record<string, unknown>;
  sessionTimeZone: string;
}) => {
  const [escapedQuery, values] =
    globalThis.testDataSource.driver.escapeQueryWithParameters(
      query,
      parameters,
      {},
    );
  const queryRunner = globalThis.testDataSource.createQueryRunner();

  await queryRunner.connect();

  try {
    await queryRunner.startTransaction();
    await queryRunner.query("SELECT set_config('TimeZone', $1, true)", [
      sessionTimeZone,
    ]);

    const [row] = await queryRunner.query(escapedQuery, values);

    return row.value;
  } finally {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  }
};

const evaluateInPostgres = async ({
  expression,
  sessionTimeZone,
}: {
  expression: string;
  sessionTimeZone: string;
}) => {
  const { sql, type, parameters } = compileComputedFieldExpressionToSql({
    expression,
    resolveField: () => {
      throw new Error('Parity cases only use literals');
    },
  });

  return queryInSessionTimeZone({
    query: `SELECT ${toComparableSelect({ sql, type })} AS "value"`,
    parameters,
    sessionTimeZone,
  });
};

// America/Santiago starts daylight saving at midnight (on 2026-09-06), so local midnights are skipped
const SESSION_TIME_ZONES = ['UTC', 'America/Santiago'];

describe('date functions: shared evaluator and Postgres agree', () => {
  it.each(PARITY_CASES)(
    '%s(%j) is %j',
    async (functionName, functionArguments, expected) => {
      expect(
        EVALUATOR_BY_FUNCTION_NAME[functionName](...functionArguments),
      ).toBe(expected);

      for (const sessionTimeZone of SESSION_TIME_ZONES) {
        expect(
          await evaluateInPostgres({
            expression: `${functionName}(${functionArguments.map(toExpressionLiteral).join(', ')})`,
            sessionTimeZone,
          }),
        ).toBe(expected);
      }
    },
  );
});

describe('dateAdd with an amount read from a column', () => {
  it('gives null for the out-of-range row instead of failing the whole read', async () => {
    const { sql, type } = compileComputedFieldExpressionToSql({
      expression: "dateAdd(startDate, durationDays, 'DAY')",
      resolveField: ([fieldName]) => ({
        sql: `"record"."${fieldName}"`,
        type:
          fieldName === 'startDate'
            ? FieldMetadataType.DATE
            : FieldMetadataType.NUMBER,
      }),
    });

    const rows = await globalThis.testDataSource.query(
      `SELECT ${toComparableSelect({ sql, type })} AS "value" FROM (VALUES ('2026-01-01'::date, 1e12::float8), ('2026-01-01'::date, 30::float8)) AS "record"("startDate", "durationDays")`,
    );

    expect(rows.map((row: { value: string | null }) => row.value)).toEqual([
      null,
      '2026-01-31',
    ]);
  });
});

const COMPARISON_RECORD = {
  closeDate: '2026-10-01',
  startDate: '2026-09-01',
  createdAt: '2026-09-23T10:00:00.000Z',
};

const COMPARISON_FIELDS = [
  {
    name: 'closeDate',
    type: FieldMetadataType.DATE,
    universalIdentifier: 'close-date',
  },
  {
    name: 'startDate',
    type: FieldMetadataType.DATE,
    universalIdentifier: 'start-date',
  },
  {
    name: 'createdAt',
    type: FieldMetadataType.DATE_TIME,
    universalIdentifier: 'created-at',
  },
];

const COMPARISON_CASES: [string, boolean][] = [
  ["closeDate >= dateAdd(createdAt, 8, 'DAY')", true],
  ["closeDate > dateAdd(createdAt, 8, 'DAY')", false],
  ["startDate == dateTrunc(createdAt, 'MONTH')", true],
  ["startDate != dateTrunc(createdAt, 'MONTH')", false],
  ["createdAt > '2026-09-23'", false],
  ["createdAt >= '2026-09-23'", true],
  ["createdAt == '2026-09-23'", true],
  ['startDate < createdAt', true],
];

describe('nested date functions', () => {
  it('evaluates ten nested dateAdd calls in Postgres as the shared evaluator does', async () => {
    const expression = Array.from({ length: 10 }).reduce<string>(
      (nestedExpression) => `dateAdd(${nestedExpression}, 1, 'MONTH')`,
      "'2026-01-31'",
    );
    const { sql, type, parameters } = compileComputedFieldExpressionToSql({
      expression,
      resolveField: () => {
        throw new Error('Only literals are used');
      },
    });

    expect(
      await queryInSessionTimeZone({
        query: `SELECT ${toComparableSelect({ sql, type })} AS "value"`,
        parameters,
        sessionTimeZone: 'UTC',
      }),
    ).toBe('2026-11-28');
  });
});

describe('comparing a date with a date and time: rules and Postgres agree', () => {
  it.each(COMPARISON_CASES)('%s is %s', async (expression, expected) => {
    expect(
      evaluateValidationRuleExpression({
        expression,
        record: COMPARISON_RECORD,
        fields: COMPARISON_FIELDS,
        now: '2026-09-23T12:00:00.000Z',
      }),
    ).toEqual({ status: expected ? 'passed' : 'failed' });

    const { sql, parameters } = compileComputedFieldExpressionToSql({
      expression,
      resolveField: ([fieldName]) => ({
        sql: `"record"."${fieldName}"`,
        type:
          fieldName === 'createdAt'
            ? FieldMetadataType.DATE_TIME
            : FieldMetadataType.DATE,
      }),
    });

    for (const sessionTimeZone of ['UTC', 'America/New_York']) {
      expect(
        await queryInSessionTimeZone({
          query: `SELECT ${sql} AS "value" FROM (VALUES ('${COMPARISON_RECORD.closeDate}'::date, '${COMPARISON_RECORD.startDate}'::date, '${COMPARISON_RECORD.createdAt}'::timestamptz)) AS "record"("closeDate", "startDate", "createdAt")`,
          parameters,
          sessionTimeZone,
        }),
      ).toBe(expected);
    }
  });
});
