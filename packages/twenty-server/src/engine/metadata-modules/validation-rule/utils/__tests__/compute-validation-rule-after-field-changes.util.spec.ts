import { type ValidationRuleFieldChange } from 'src/engine/metadata-modules/validation-rule/types/validation-rule-field-change.type';
import { computeValidationRuleAfterFieldChanges } from 'src/engine/metadata-modules/validation-rule/utils/compute-validation-rule-after-field-changes.util';

const AMOUNT_UNIVERSAL_IDENTIFIER = 'amount-universal-identifier';
const COMPANY_UNIVERSAL_IDENTIFIER = 'company-universal-identifier';
const EMPLOYEES_UNIVERSAL_IDENTIFIER = 'employees-universal-identifier';
const STAGE_UNIVERSAL_IDENTIFIER = 'stage-universal-identifier';

const RULE = {
  expression: '$f1 != "CUSTOMER" or not isEmpty($f2)',
  bindings: {
    $f1: STAGE_UNIVERSAL_IDENTIFIER,
    $f2: AMOUNT_UNIVERSAL_IDENTIFIER,
  },
  isActive: true,
  errorFieldMetadataUniversalIdentifier: AMOUNT_UNIVERSAL_IDENTIFIER,
};

const COMPANY_RULE = {
  ...RULE,
  expression: 'not isDefined($f1) or $f1.$f2 > 10',
  bindings: {
    $f1: COMPANY_UNIVERSAL_IDENTIFIER,
    $f2: EMPLOYEES_UNIVERSAL_IDENTIFIER,
  },
  errorFieldMetadataUniversalIdentifier: null,
};

const retype = (
  fieldUniversalIdentifier: string,
): ValidationRuleFieldChange => ({
  fieldUniversalIdentifier,
  shouldDetachErrorField: false,
});

const deletion = (
  fieldUniversalIdentifier: string,
): ValidationRuleFieldChange => ({
  fieldUniversalIdentifier,
  shouldDetachErrorField: true,
});

describe('computeValidationRuleAfterFieldChanges', () => {
  it('should disable a rule that reads a deleted field and move its error to the record level, keeping the condition', () => {
    expect(
      computeValidationRuleAfterFieldChanges({
        validationRule: RULE,
        fieldChanges: [deletion(AMOUNT_UNIVERSAL_IDENTIFIER)],
      }),
    ).toEqual({
      ...RULE,
      isActive: false,
      errorFieldMetadataUniversalIdentifier: null,
    });
  });

  it('should disable a rule when the type of a related-record field it reads changes', () => {
    expect(
      computeValidationRuleAfterFieldChanges({
        validationRule: COMPANY_RULE,
        fieldChanges: [retype(EMPLOYEES_UNIVERSAL_IDENTIFIER)],
      }),
    ).toEqual({ ...COMPANY_RULE, isActive: false });
  });

  it('should move errors shown on the field to the record level without disabling a rule that does not read it', () => {
    expect(
      computeValidationRuleAfterFieldChanges({
        validationRule: {
          ...RULE,
          expression: 'isDefined($f1)',
          bindings: { $f1: STAGE_UNIVERSAL_IDENTIFIER },
        },
        fieldChanges: [deletion(AMOUNT_UNIVERSAL_IDENTIFIER)],
      }),
    ).toMatchObject({
      isActive: true,
      errorFieldMetadataUniversalIdentifier: null,
    });
  });

  it('should give the same result when the changes are applied again', () => {
    const fieldChanges = [
      retype(STAGE_UNIVERSAL_IDENTIFIER),
      deletion(AMOUNT_UNIVERSAL_IDENTIFIER),
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
          retype('unrelated-universal-identifier'),
          deletion('unrelated-universal-identifier'),
        ],
      }),
    ).toBe(RULE);
  });
});
