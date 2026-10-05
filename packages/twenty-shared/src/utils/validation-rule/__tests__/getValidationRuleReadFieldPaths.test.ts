import { FieldMetadataType } from '@/types/FieldMetadataType';
import { RelationType } from '@/types/RelationType';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { getValidationRuleReadFieldPaths } from '@/utils/validation-rule/getValidationRuleReadFieldPaths';

const FIELDS: ValidationRuleFieldDescriptor[] = [
  {
    name: 'dealValue',
    type: FieldMetadataType.CURRENCY,
    universalIdentifier: 'opportunity-amount',
  },
  {
    name: 'account',
    type: FieldMetadataType.RELATION,
    universalIdentifier: 'opportunity-company',
    relationType: RelationType.MANY_TO_ONE,
    relationTargetFields: [
      {
        name: 'sector',
        type: FieldMetadataType.TEXT,
        universalIdentifier: 'company-industry',
      },
    ],
  },
];

describe('getValidationRuleReadFieldPaths', () => {
  it('should list the current names of the fields and related fields a rule reads', () => {
    expect(
      getValidationRuleReadFieldPaths({
        expression:
          '$f1.$f2 != "SaaS" or not isEmpty($f3.amountMicros) or now > "2026-01-01"',
        bindings: {
          $f1: 'opportunity-company',
          $f2: 'company-industry',
          $f3: 'opportunity-amount',
        },
        fields: FIELDS,
      }),
    ).toEqual(['account', 'account.sector', 'dealValue']);
  });

  it('should skip what cannot be resolved', () => {
    expect(
      getValidationRuleReadFieldPaths({
        expression: 'isDefined($f1) or isDefined($f2)',
        bindings: { $f1: 'deleted-field', $f2: 'opportunity-amount' },
        fields: FIELDS,
      }),
    ).toEqual(['dealValue']);
    expect(
      getValidationRuleReadFieldPaths({
        expression: '$f1 >',
        bindings: {},
        fields: FIELDS,
      }),
    ).toEqual([]);
  });
});
