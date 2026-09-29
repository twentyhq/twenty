import { type ValidationRuleFieldChange } from 'src/engine/metadata-modules/validation-rule/types/validation-rule-field-change.type';
import { computeValidationRuleAfterFieldChanges } from 'src/engine/metadata-modules/validation-rule/utils/compute-validation-rule-after-field-changes.util';

const AMOUNT_UNIVERSAL_IDENTIFIER = 'amount-universal-identifier';
const CODE_UNIVERSAL_IDENTIFIER = 'code-universal-identifier';
const COMPANY_UNIVERSAL_IDENTIFIER = 'company-universal-identifier';
const EMPLOYEES_UNIVERSAL_IDENTIFIER = 'employees-universal-identifier';
const PRIORITY_UNIVERSAL_IDENTIFIER = 'priority-universal-identifier';
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

const COMPANY_RULE = {
  ...RULE,
  expression: 'not isDefined(company) or company.employees > 10',
  bindings: {
    company: COMPANY_UNIVERSAL_IDENTIFIER,
    'company.employees': EMPLOYEES_UNIVERSAL_IDENTIFIER,
  },
  errorFieldMetadataUniversalIdentifier: null,
};

const rename = (
  fieldUniversalIdentifier: string,
  newFieldName: string,
): ValidationRuleFieldChange => ({
  fieldUniversalIdentifier,
  newFieldName,
  shouldDisableRulesReadingField: false,
  shouldDetachErrorField: false,
});

const deletion = (
  fieldUniversalIdentifier: string,
): ValidationRuleFieldChange => ({
  fieldUniversalIdentifier,
  newFieldName: null,
  shouldDisableRulesReadingField: true,
  shouldDetachErrorField: true,
});

describe('computeValidationRuleAfterFieldChanges', () => {
  it('should rename a field in the expression and the bindings, leaving strings alone', () => {
    expect(
      computeValidationRuleAfterFieldChanges({
        validationRule: {
          ...RULE,
          expression: 'amount.amountMicros > 0 and stage != "amount"',
        },
        fieldChanges: [rename(AMOUNT_UNIVERSAL_IDENTIFIER, 'dealValue')],
      }),
    ).toMatchObject({
      expression: 'dealValue.amountMicros > 0 and stage != "amount"',
      bindings: {
        dealValue: AMOUNT_UNIVERSAL_IDENTIFIER,
        stage: STAGE_UNIVERSAL_IDENTIFIER,
      },
      isActive: true,
    });
  });

  it('should rename a related-record field, the relation itself, or both at once', () => {
    expect(
      computeValidationRuleAfterFieldChanges({
        validationRule: COMPANY_RULE,
        fieldChanges: [rename(EMPLOYEES_UNIVERSAL_IDENTIFIER, 'headcount')],
      }).expression,
    ).toBe('not isDefined(company) or company.headcount > 10');
    expect(
      computeValidationRuleAfterFieldChanges({
        validationRule: COMPANY_RULE,
        fieldChanges: [rename(COMPANY_UNIVERSAL_IDENTIFIER, 'account')],
      }).expression,
    ).toBe('not isDefined(account) or account.employees > 10');
    expect(
      computeValidationRuleAfterFieldChanges({
        validationRule: COMPANY_RULE,
        fieldChanges: [
          rename(COMPANY_UNIVERSAL_IDENTIFIER, 'account'),
          rename(EMPLOYEES_UNIVERSAL_IDENTIFIER, 'headcount'),
        ],
      }),
    ).toMatchObject({
      expression: 'not isDefined(account) or account.headcount > 10',
      bindings: {
        account: COMPANY_UNIVERSAL_IDENTIFIER,
        'account.headcount': EMPLOYEES_UNIVERSAL_IDENTIFIER,
      },
    });
  });

  it('should apply a rename and a deletion of two fields of the same rule together', () => {
    expect(
      computeValidationRuleAfterFieldChanges({
        validationRule: RULE,
        fieldChanges: [
          rename(STAGE_UNIVERSAL_IDENTIFIER, 'phase'),
          deletion(AMOUNT_UNIVERSAL_IDENTIFIER),
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

  it('should swap two field names in one pass', () => {
    expect(
      computeValidationRuleAfterFieldChanges({
        validationRule: RULE,
        fieldChanges: [
          rename(STAGE_UNIVERSAL_IDENTIFIER, 'amount'),
          rename(AMOUNT_UNIVERSAL_IDENTIFIER, 'stage'),
        ],
      }),
    ).toMatchObject({
      expression: 'amount != "CUSTOMER" or not isEmpty(stage)',
      bindings: {
        amount: STAGE_UNIVERSAL_IDENTIFIER,
        stage: AMOUNT_UNIVERSAL_IDENTIFIER,
      },
      isActive: true,
    });
  });

  it('should keep the condition and disable the rule when a rename takes the name of a field it still reads', () => {
    const validationRule = {
      expression: 'isNonEmptyString(code) and isNonEmptyString(priority)',
      bindings: {
        code: CODE_UNIVERSAL_IDENTIFIER,
        priority: PRIORITY_UNIVERSAL_IDENTIFIER,
      },
      isActive: true,
      errorFieldMetadataUniversalIdentifier: null,
    };

    expect(
      computeValidationRuleAfterFieldChanges({
        validationRule,
        fieldChanges: [
          rename(PRIORITY_UNIVERSAL_IDENTIFIER, 'code'),
          deletion(CODE_UNIVERSAL_IDENTIFIER),
        ],
      }),
    ).toEqual({ ...validationRule, isActive: false });
  });

  it('should move errors shown on the field to the record level without disabling a rule that does not read it', () => {
    expect(
      computeValidationRuleAfterFieldChanges({
        validationRule: {
          ...RULE,
          expression: 'isDefined(stage)',
          bindings: { stage: STAGE_UNIVERSAL_IDENTIFIER },
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
      rename(STAGE_UNIVERSAL_IDENTIFIER, 'phase'),
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
          rename('unrelated-universal-identifier', 'other'),
          deletion('unrelated-universal-identifier'),
        ],
      }),
    ).toBe(RULE);
  });
});
