import { compileComputedFieldExpressionToSql } from 'src/engine/metadata-modules/computed-field/utils/compile-computed-field-expression-to-sql.util';

const compile = (expression: string) =>
  compileComputedFieldExpressionToSql({
    expression,
    resolveFieldPathSql: (path) => `"record"."${path.join('_')}"`,
  });

describe('compileComputedFieldExpressionToSql', () => {
  it.each([
    ['amount + 1', '("record"."amount" + 1)'],
    ['-amount * 2', '((-"record"."amount") * 2)'],
    ['abs(amount - 5)', 'ABS(("record"."amount" - 5))'],
    [
      'amount / quantity',
      '("record"."amount"::numeric / NULLIF("record"."quantity", 0))',
    ],
    ["status != 'DONE'", `("record"."status" <> 'DONE')`],
    ["name == 'it\\'s'", `("record"."name" = 'it''s')`],
    [
      'isActive and not isArchived or amount >= 10',
      '(("record"."isActive" AND (NOT "record"."isArchived")) OR ("record"."amount" >= 10))',
    ],
    ["status in ['TODO', 'DOING']", `("record"."status" IN ('TODO', 'DOING'))`],
    [
      'amount > 0 ? amount : 0',
      '(CASE WHEN ("record"."amount" > 0) THEN "record"."amount" ELSE 0 END)',
    ],
    [
      "if(isActive, 'on', 'off')",
      `(CASE WHEN "record"."isActive" THEN 'on' ELSE 'off' END)`,
    ],
    [
      'round(amount / 3, 2)',
      'ROUND(("record"."amount"::numeric / NULLIF(3, 0))::numeric, 2::int)',
    ],
    [
      "concat(name, ' ', company.name)",
      `CONCAT("record"."name", ' ', "record"."company_name")`,
    ],
    [
      'coalesce(amount.amountMicros, 0)',
      'COALESCE("record"."amount_amountMicros", 0)',
    ],
    ['dueAt >= today', '("record"."dueAt" >= CURRENT_DATE)'],
    [
      'daysSince(createdAt) > 30',
      '((CURRENT_DATE - "record"."createdAt"::date) > 30)',
    ],
    [
      'isDefined(closedAt) == true',
      '(("record"."closedAt" IS NOT NULL) = TRUE)',
    ],
  ])('compiles %s', (expression, expectedSql) => {
    expect(compile(expression)).toBe(expectedSql);
  });

  it.each([
    ['', 'empty'],
    ['amount +', 'unexpected'],
    ['sqrt(amount)', 'Unknown function "sqrt"'],
    ['amount ^ 2', ''],
    ['[1, 2]', 'A list can only be used after "in"'],
    ['amount in 3', '"in" must be followed by a non-empty list'],
    ['round()', '"round" does not take 0 argument(s)'],
    ['amount; 1', ''],
  ])('rejects %s', (expression, expectedMessage) => {
    expect(() => compile(expression)).toThrow(expectedMessage);
  });

  it('never lets a text value break out of its quotes', () => {
    expect(compile(`name == "'; DROP TABLE person; --"`)).toBe(
      `("record"."name" = '''; DROP TABLE person; --')`,
    );
  });
});
