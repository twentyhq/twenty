import { FieldMetadataType } from '@/types/FieldMetadataType';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { evaluateValidationRuleExpression } from '@/utils/validation-rule/evaluateValidationRuleExpression';

const FIELDS: ValidationRuleFieldDescriptor[] = [
  {
    name: 'name',
    type: FieldMetadataType.TEXT,
    universalIdentifier: 'gadget-name',
  },
  {
    name: 'nickname',
    type: FieldMetadataType.TEXT,
    universalIdentifier: 'gadget-nickname',
  },
  {
    name: 'price',
    type: FieldMetadataType.NUMBER,
    universalIdentifier: 'gadget-price',
  },
  {
    name: 'discount',
    type: FieldMetadataType.NUMBER,
    universalIdentifier: 'gadget-discount',
  },
  {
    name: 'tags',
    type: FieldMetadataType.MULTI_SELECT,
    universalIdentifier: 'gadget-tags',
  },
];

const RECORD = {
  name: 'Widget',
  nickname: null,
  price: 12.345,
  discount: null,
  tags: ['NEW'],
};

const isTrue = (expression: string) =>
  evaluateValidationRuleExpression({
    expression,
    record: RECORD,
    fields: FIELDS,
    now: '2026-09-23T10:00:00.000Z',
  }).status === 'passed';

describe('value functions in validation rule expressions', () => {
  it.each([
    'if(price > 10, "high", "low") == "high"',
    'if(price > 100, "high", "low") == "low"',
    // Only true takes the first branch, a filled value does not
    'if(name, "set", "unset") == "unset"',
    'coalesce(nickname, name) == "Widget"',
    'coalesce(discount, 0) == 0',
    'not isDefined(coalesce(nickname, discount))',
    'concat(name, " #", 7) == "Widget #7"',
    'concat(name, nickname, "!") == "Widget!"',
    'lower(name) == "widget"',
    'upper(name) == "WIDGET"',
    'not isDefined(upper(nickname))',
    'min(price, 5, 20) == 5',
    'max(price, 5, 20) == 20',
    // Empty numbers are left out instead of counting as zero
    'max(discount, -3) == -3',
    'not isDefined(min(discount))',
    'roundTo(price, 2) == 12.35',
    'roundTo(price, 0) == 12',
    'not isDefined(roundTo(discount, 2))',
    'roundTo(2.55, 1) == 2.6',
    'length("😀") == 1',
    'length(nickname) == 0',
  ])('should hold: %s', (expression) => {
    expect(isTrue(expression)).toBe(true);
  });

  it('should read an empty value as empty text when concatenating with ||', () => {
    expect(isTrue('(name || nickname || "!") == "Widget!"')).toBe(true);
    expect(isTrue('arrayLength(tags || tags) == 2')).toBe(true);
  });
});
