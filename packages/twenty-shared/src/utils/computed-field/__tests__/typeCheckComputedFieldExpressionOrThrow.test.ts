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
    ['daysBetween(createdAt, dueAt)', NUMBER],
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
      functionArguments: [{}, { kind: 'textLiteral', type: DATE_TIME }],
    });
    expect(typeCheck("daysSince('2030-01-01')")).toMatchObject({
      functionArguments: [{ kind: 'textLiteral', type: DATE }],
    });
    expect(typeCheck("name == '2030-01-01'")).toMatchObject({
      right: { kind: 'textLiteral', type: TEXT },
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
    ['daysSince(amount)', '"daysSince" cannot combine date and number'],
    ["dueAt > 'tomorrow-ish'", "which is not a date such as '2030-01-31'"],
    ["coalesce(dueAt, 'n/a')", "which is not a date such as '2030-01-31'"],
    ["dueAt > '2030-02-31'", "which is not a date such as '2030-01-31'"],
  ])('rejects %s', (expression, expectedMessage) => {
    expect(() => typeCheck(expression)).toThrow(expectedMessage);
  });
});
