import { FieldMetadataType } from '@/types/FieldMetadataType';
import { printValidationRuleExpression } from '@/utils/validation-rule/printValidationRuleExpression';

const FIELDS = [
  {
    name: 'dealStage',
    type: FieldMetadataType.SELECT,
    universalIdentifier: 'stage-universal-identifier',
  },
];

describe('printValidationRuleExpression', () => {
  it('should print the fields a tree reads with their current names', () => {
    expect(
      printValidationRuleExpression({
        tree: {
          type: 'COMPARISON',
          operator: 'NOT_EQUAL',
          left: {
            type: 'FIELD',
            fieldUniversalIdentifier: 'stage-universal-identifier',
            isPreviousValue: true,
          },
          right: { type: 'LITERAL', value: 'WON' },
        },
        fields: FIELDS,
      }),
    ).toBe('previous.dealStage != "WON"');
  });

  it.each([null, undefined, { type: 'UNKNOWN' }])(
    'should print nothing for a tree it cannot read: %p',
    (tree) => {
      expect(printValidationRuleExpression({ tree, fields: FIELDS })).toBe(
        undefined,
      );
    },
  );
});
