import {
  type ComputedFieldValueType,
  FieldMetadataType,
} from 'twenty-shared/types';

import { compileComputedFieldExpressionToSql } from 'src/engine/metadata-modules/computed-field/utils/compile-computed-field-expression-to-sql.util';

const { NUMBER, TEXT, BOOLEAN, DATE, DATE_TIME } = FieldMetadataType;

const FIELD_TYPE_BY_PATH: Record<string, ComputedFieldValueType> = {
  amount: NUMBER,
  quantity: NUMBER,
  name: TEXT,
  status: TEXT,
  'company.name': TEXT,
  isActive: BOOLEAN,
  isArchived: BOOLEAN,
  dueAt: DATE,
  createdAt: DATE_TIME,
  closedAt: DATE_TIME,
};

const compile = (expression: string) =>
  compileComputedFieldExpressionToSql({
    expression,
    resolveField: (path) => ({
      sql: `"record"."${path.join('_')}"`,
      type: FIELD_TYPE_BY_PATH[path.join('.')],
    }),
  });

describe('compileComputedFieldExpressionToSql', () => {
  it.each([
    ['amount + 1', '("record"."amount" + 1)', NUMBER],
    ['-amount * 2', '((-"record"."amount") * 2)', NUMBER],
    ['abs(amount - 5)', 'ABS(("record"."amount" - 5))', NUMBER],
    [
      'amount / quantity',
      '("record"."amount"::numeric / NULLIF("record"."quantity", 0))',
      NUMBER,
    ],
    [
      'isActive and not isArchived or amount >= 10',
      '(("record"."isActive" AND (NOT "record"."isArchived")) OR ("record"."amount" >= 10))',
      BOOLEAN,
    ],
    [
      'amount > 0 ? amount : 0',
      '(CASE WHEN ("record"."amount" > 0) THEN "record"."amount" ELSE 0 END)',
      NUMBER,
    ],
    [
      'round(amount / 3, 2)',
      'ROUND(("record"."amount"::numeric / NULLIF(3, 0))::numeric, 2::int)',
      NUMBER,
    ],
    [
      'dueAt >= today',
      `("record"."dueAt" >= (NOW() AT TIME ZONE 'UTC')::date)`,
      BOOLEAN,
    ],
    ['createdAt < now', '("record"."createdAt" < NOW())', BOOLEAN],
    [
      'isDefined(closedAt) == true',
      '(("record"."closedAt" IS NOT NULL) = TRUE)',
      BOOLEAN,
    ],
  ])('compiles %s', (expression, expectedSql, expectedType) => {
    expect(compile(expression)).toEqual({
      sql: expectedSql,
      type: expectedType,
      parameters: {},
    });
  });

  it.each([
    [
      "dateDiff(createdAt, now, 'DAY') > 30",
      `(((NOW() AT TIME ZONE 'UTC')::date - ("record"."createdAt" AT TIME ZONE 'UTC')::date) > 30)`,
      BOOLEAN,
    ],
    [
      "dateDiff(createdAt, closedAt, 'MINUTE')",
      `TRUNC(EXTRACT(EPOCH FROM ("record"."closedAt" - "record"."createdAt")) / 60)`,
      NUMBER,
    ],
    [
      "dateDiff(dueAt, today, 'QUARTER')",
      `(SELECT TRUNC((EXTRACT(YEAR FROM "dateFunctionOperands"."age") * 12 + EXTRACT(MONTH FROM "dateFunctionOperands"."age")) / 3.0) FROM (SELECT AGE((NOW() AT TIME ZONE 'UTC')::date::timestamp, "record"."dueAt"::timestamp) AS "age" OFFSET 0) AS "dateFunctionOperands")`,
      NUMBER,
    ],
    [
      "dateAdd(dueAt, quantity, 'MONTH')",
      `(SELECT ("dateFunctionOperands"."date" + (CASE WHEN EXTRACT(EPOCH FROM "dateFunctionOperands"."date") BETWEEN -62135596800 AND 253402300799.999999 AND (EXTRACT(YEAR FROM "dateFunctionOperands"."date") * 12 + EXTRACT(MONTH FROM "dateFunctionOperands"."date") - 1 + "dateFunctionOperands"."amount" * 1) BETWEEN 12 AND 119999 THEN "dateFunctionOperands"."amount" END * INTERVAL '1 month'))::date FROM (SELECT "record"."dueAt" AS "date", TRUNC("record"."quantity"::numeric) AS "amount" OFFSET 0) AS "dateFunctionOperands")`,
      DATE,
    ],
    [
      "dateAdd(createdAt, 4, 'HOUR')",
      `(SELECT ((("dateFunctionOperands"."date" AT TIME ZONE 'UTC') + (CASE WHEN EXTRACT(EPOCH FROM "dateFunctionOperands"."date") BETWEEN -62135596800 AND 253402300799.999999 AND (EXTRACT(EPOCH FROM "dateFunctionOperands"."date") + "dateFunctionOperands"."amount" * 3600) BETWEEN -62135596800 AND 253402300799.999999 THEN "dateFunctionOperands"."amount" END * INTERVAL '1 hour')) AT TIME ZONE 'UTC') FROM (SELECT "record"."createdAt" AS "date", TRUNC(4::numeric) AS "amount" OFFSET 0) AS "dateFunctionOperands")`,
      DATE_TIME,
    ],
    [
      "dateTrunc(createdAt, 'WEEK')",
      `(DATE_TRUNC('week', ("record"."createdAt" AT TIME ZONE 'UTC')) AT TIME ZONE 'UTC')`,
      DATE_TIME,
    ],
    [
      "dateTrunc(dueAt, 'MONTH')",
      `DATE_TRUNC('month', "record"."dueAt"::timestamp)::date`,
      DATE,
    ],
    [
      "datePart(createdAt, 'DAY_OF_WEEK')",
      `EXTRACT(ISODOW FROM ("record"."createdAt" AT TIME ZONE 'UTC'))`,
      NUMBER,
    ],
  ])(
    'compiles the date function %s',
    (expression, expectedSql, expectedType) => {
      expect(compile(expression)).toMatchObject({
        sql: expectedSql,
        type: expectedType,
      });
    },
  );

  it.each([
    ['constructor', '"record"."constructor"'],
    ['constructor + 1', '("record"."constructor" + 1)'],
    ['1 + toString', '(1 + "record"."toString")'],
    ['abs(hasOwnProperty)', 'ABS("record"."hasOwnProperty")'],
  ])(
    'reads a field named like an Object.prototype member as a field, not as a variable: %s',
    (expression, sql) => {
      expect(
        compileComputedFieldExpressionToSql({
          expression,
          resolveField: (path) => ({
            sql: `"record"."${path.join('_')}"`,
            type: NUMBER,
          }),
        }),
      ).toEqual({ sql, type: NUMBER, parameters: {} });
    },
  );

  it('binds text values as parameters instead of writing them into the SQL', () => {
    expect(compile(`name == "'; DROP TABLE person; --"`)).toEqual({
      sql: '("record"."name" = :text0::text)',
      type: BOOLEAN,
      parameters: { text0: "'; DROP TABLE person; --" },
    });

    expect(compile("concat(name, ' ', company.name)")).toEqual({
      sql: 'CONCAT("record"."name", :text0::text, "record"."company_name")',
      type: TEXT,
      parameters: { text0: ' ' },
    });
  });

  it('keeps records whose value is missing when comparing with "!="', () => {
    expect(compile("status != 'DONE'").sql).toBe(
      '("record"."status" IS DISTINCT FROM :text0::text)',
    );
  });

  it('writes each operand of a nested date function once', () => {
    const nestedExpression = Array.from({ length: 10 }).reduce<string>(
      (expression) => `dateAdd(${expression}, 1, 'MONTH')`,
      'dueAt',
    );

    expect(
      compile(nestedExpression).sql.split('"record"."dueAt"'),
    ).toHaveLength(2);
  });

  it('compares a date and a date and time as UTC days', () => {
    expect(compile("createdAt > '2026-01-01'").sql).toBe(
      `(("record"."createdAt" AT TIME ZONE 'UTC')::date > :text0::date)`,
    );
    expect(compile('dueAt == createdAt').sql).toBe(
      `("record"."dueAt" = ("record"."createdAt" AT TIME ZONE 'UTC')::date)`,
    );
  });

  it('widens a date to a date and time outside comparisons, whatever the order', () => {
    expect(compile('coalesce(dueAt, createdAt)')).toMatchObject({
      sql: `COALESCE(("record"."dueAt"::timestamp AT TIME ZONE 'UTC'), "record"."createdAt")`,
      type: DATE_TIME,
    });
    expect(compile('coalesce(createdAt, dueAt)')).toMatchObject({
      sql: `COALESCE("record"."createdAt", ("record"."dueAt"::timestamp AT TIME ZONE 'UTC'))`,
      type: DATE_TIME,
    });
  });

  it('binds a date literal in a comparison as the shared parser reads it', () => {
    expect(
      compile("createdAt == '2026-09-23T10:41:00+02:00[Europe/Paris]'"),
    ).toMatchObject({
      sql: '("record"."createdAt" = :text0::timestamptz)',
      parameters: { text0: '2026-09-23T08:41:00.000Z' },
    });
  });

  it('reads a date text by its shape and never binds a unit', () => {
    expect(
      compile("dateDiff('2026-01-31', '2026-03-01T10:00:00Z', 'MONTH')"),
    ).toEqual({
      sql: `(SELECT (EXTRACT(YEAR FROM "dateFunctionOperands"."age") * 12 + EXTRACT(MONTH FROM "dateFunctionOperands"."age")) FROM (SELECT AGE((:text1::timestamptz AT TIME ZONE 'UTC')::date::timestamp, :text0::date::timestamp) AS "age" OFFSET 0) AS "dateFunctionOperands")`,
      type: NUMBER,
      parameters: {
        text0: '2026-01-31',
        text1: '2026-03-01T10:00:00.000Z',
      },
    });
  });

  it('reads a text value compared with a date as a date', () => {
    expect(compile("dueAt >= '2030-01-01'").sql).toBe(
      '("record"."dueAt" >= :text0::date)',
    );
    expect(compile("status in ['TODO', 'DOING']").sql).toBe(
      '("record"."status" IN (:text0::text, :text1::text))',
    );
  });

  it('refuses an expression that does not type check', () => {
    expect(() => compile('amount + name')).toThrow(
      '"+" expects number, not text',
    );
  });
});
