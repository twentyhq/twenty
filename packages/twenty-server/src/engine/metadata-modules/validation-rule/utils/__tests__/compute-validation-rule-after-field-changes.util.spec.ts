import { computeValidationRuleAfterFieldChanges } from 'src/engine/metadata-modules/validation-rule/utils/compute-validation-rule-after-field-changes.util';

const AMOUNT_UNIVERSAL_IDENTIFIER = 'amount-universal-identifier';
const STAGE_UNIVERSAL_IDENTIFIER = 'stage-universal-identifier';

const RULE = {
  expression: 'stage != "CUSTOMER" or not isEmpty(amount)',
  bindings: {
    stage: STAGE_UNIVERSAL_IDENTIFIER,
    amount: AMOUNT_UNIVERSAL_IDENTIFIER,
  },
  isActive: true,
  errorFieldMetadataUniversalIdentifier: AMOUNT_UNIVERSAL_IDENTIFIER,
};

describe('computeValidationRuleAfterFieldChanges', () => {
  it('should apply a rename and a deactivation of two fields of the same rule together', () => {
    expect(
      computeValidationRuleAfterFieldChanges({
        validationRule: RULE,
        fieldChanges: [
          {
            fieldUniversalIdentifier: STAGE_UNIVERSAL_IDENTIFIER,
            newFieldName: 'phase',
            shouldDisableRulesReadingField: false,
            shouldDetachErrorField: false,
          },
          {
            fieldUniversalIdentifier: AMOUNT_UNIVERSAL_IDENTIFIER,
            newFieldName: null,
            shouldDisableRulesReadingField: true,
            shouldDetachErrorField: true,
          },
        ],
      }),
    ).toEqual({
      expression: 'phase != "CUSTOMER" or not isEmpty(amount)',
      bindings: {
        phase: STAGE_UNIVERSAL_IDENTIFIER,
        amount: AMOUNT_UNIVERSAL_IDENTIFIER,
      },
      isActive: false,
      errorFieldMetadataUniversalIdentifier: null,
    });
  });

  it('should give the same result when the changes are applied again', () => {
    const fieldChanges = [
      {
        fieldUniversalIdentifier: STAGE_UNIVERSAL_IDENTIFIER,
        newFieldName: 'phase',
        shouldDisableRulesReadingField: false,
        shouldDetachErrorField: false,
      },
    ];
    const updatedRule = computeValidationRuleAfterFieldChanges({
      validationRule: RULE,
      fieldChanges,
    });

    expect(
      computeValidationRuleAfterFieldChanges({
        validationRule: updatedRule,
        fieldChanges,
      }),
    ).toEqual(updatedRule);
  });

  it('should return the same rule when no change touches it', () => {
    expect(
      computeValidationRuleAfterFieldChanges({
        validationRule: RULE,
        fieldChanges: [
          {
            fieldUniversalIdentifier: 'unrelated-universal-identifier',
            newFieldName: 'other',
            shouldDisableRulesReadingField: true,
            shouldDetachErrorField: true,
          },
        ],
      }),
    ).toBe(RULE);
  });
});
