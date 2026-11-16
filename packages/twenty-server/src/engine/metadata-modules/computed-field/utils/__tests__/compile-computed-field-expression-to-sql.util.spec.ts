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
      'daysSince(createdAt) > 30',
      `(((NOW() AT TIME ZONE 'UTC')::date - "record"."createdAt"::date) > 30)`,
      BOOLEAN,
    ],
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
