import { type ComputedFieldValueType } from '@/types/ComputedFieldValueType';
import { FieldMetadataType } from '@/types/FieldMetadataType';
import { parseComputedFieldExpressionOrThrow } from '@/utils/computed-field/parseComputedFieldExpressionOrThrow';
import { typeCheckComputedFieldExpressionOrThrow } from '@/utils/computed-field/typeCheckComputedFieldExpressionOrThrow';

const { NUMBER, TEXT, BOOLEAN, DATE, DATE_TIME } = FieldMetadataType;

const FIELD_TYPE_BY_PATH: Record<string, ComputedFieldValueType> = {
  amount: NUMBER,
  name: TEXT,
  status: TEXT,
  isActive: BOOLEAN,
  isArchived: BOOLEAN,
  dueAt: DATE,
  createdAt: DATE_TIME,
};

const typeCheck = (expression: string) =>
  typeCheckComputedFieldExpressionOrThrow({
    expression: parseComputedFieldExpressionOrThrow(expression),
    getFieldType: (path) => FIELD_TYPE_BY_PATH[path.join('.')],
  });

describe('typeCheckComputedFieldExpressionOrThrow', () => {
  it.each([
    ['amount / 2', NUMBER],
    ['-amount % 3', NUMBER],
    ['isActive and not isArchived or amount >= 10', BOOLEAN],
    ['amount > 0 ? amount : 0', NUMBER],
    ["if(isActive, name, 'none')", TEXT],
    ['coalesce(dueAt, today)', DATE],
    ['max(createdAt, now)', DATE_TIME],
    ["name || ' ' || status", TEXT],
    ["status in ['TODO', 'DOING']", BOOLEAN],
    ['length(name)', NUMBER],
    ["dateDiff(createdAt, dueAt, 'DAY')", NUMBER],
    ["dateAdd(dueAt, 1, 'MONTH')", DATE],
    ["dateAdd(dueAt, 90, 'MINUTE')", DATE_TIME],
    ["dateTrunc(createdAt, 'WEEK')", DATE_TIME],
    ["datePart(dueAt, 'DAY_OF_WEEK')", NUMBER],
    ['coalesce(dueAt, createdAt)', DATE_TIME],
    ['isEmpty(hidden)', BOOLEAN],
    ['hidden', undefined],
    ['coalesce(hidden, amount)', NUMBER],
  ])('types %s', (expression, expectedType) => {
    expect(typeCheck(expression).type).toBe(expectedType);
  });

  it('reads a text literal next to a date as a date, and leaves the others as text', () => {
    expect(typeCheck("dueAt >= '2030-01-01'")).toMatchObject({
      right: { kind: 'textLiteral', value: '2030-01-01', type: DATE },
    });
    expect(typeCheck("coalesce(createdAt, '2030-01-01')")).toMatchObject({
      functionArguments: [
        {},
        {
          kind: 'dateConversion',
          operand: { kind: 'textLiteral', type: DATE },
          type: DATE_TIME,
        },
      ],
    });
    expect(
      typeCheck("dateTrunc('2026-09-23T10:41:00+02:00[Europe/Paris]', 'DAY')"),
    ).toMatchObject({
      functionArguments: [
        {
          kind: 'textLiteral',
          value: '2026-09-23T08:41:00.000Z',
          type: DATE_TIME,
        },
        {},
      ],
    });
    expect(typeCheck("name == '2030-01-01'")).toMatchObject({
      right: { kind: 'textLiteral', type: TEXT },
    });
  });

  it('compares a date and a date and time as UTC days, and widens a date elsewhere', () => {
    expect(typeCheck('createdAt > dueAt')).toMatchObject({
      left: {
        kind: 'dateConversion',
        operand: { type: DATE_TIME },
        type: DATE,
      },
      right: { type: DATE },
    });
    expect(typeCheck('max(dueAt, createdAt)')).toMatchObject({
      functionArguments: [
        { kind: 'dateConversion', operand: { type: DATE }, type: DATE_TIME },
        { type: DATE_TIME },
      ],
      type: DATE_TIME,
    });
  });

  it.each([
    ['sqrt(amount)', 'Unknown function "sqrt"'],
    ['toString(amount)', 'Unknown function "toString"'],
    ['[1, 2]', 'A list can only be used after "in"'],
    ['amount in 3', '"in" must be followed by a non-empty list'],
    ['amount in []', '"in" must be followed by a non-empty list'],
    ['round()', '"round" does not take 0 argument(s)'],
    ['amount + name', '"+" expects number, not text'],
    ['not amount', '"not" expects boolean, not number'],
    ['amount == name', '"==" cannot combine number and text'],
    ['isActive > isArchived', '">" expects'],
    ['if(amount, 1, 2)', 'The condition of "if" expects boolean, not number'],
    ['amount ? 1 : 2', 'The condition of "? :" expects boolean, not number'],
    ["if(isActive, 1, 'one')", '"if" cannot combine number and text'],
    ['upper(amount)', '"upper" expects text, not number'],
    ['round(name)', '"round" expects number, not text'],
    ['amount and isActive', '"and" expects boolean, not number'],
    ["dateDiff(amount, now, 'DAY')", '"dateDiff" expects date or date_time'],
    ["dateAdd(createdAt, name, 'DAY')", '"dateAdd" expects number, not text'],
    ["dateTrunc(createdAt, 'day')", '"day" is not a date unit'],
    ["datePart(createdAt, 'WEEKDAY')", '"WEEKDAY" is not a date part'],
    ['dateTrunc(createdAt, name)', 'needs its unit written as text'],
    ["dueAt > 'tomorrow-ish'", 'cannot read "tomorrow-ish" as a date'],
    ["coalesce(dueAt, 'n/a')", 'cannot read "n/a" as a date'],
    ["dueAt > '2030-02-31'", 'cannot read "2030-02-31" as a date'],
    ["createdAt > '2026-01-01T10:00:00'", 'cannot read "2026-01-01T10:00:00"'],
    ["dueAt > '+010000-01-01'", 'cannot read "+010000-01-01" as a date'],
  ])('rejects %s', (expression, expectedMessage) => {
    expect(() => typeCheck(expression)).toThrow(expectedMessage);
  });
});
