import {
  computeValidationRuleAfterFieldChange,
  type ValidationRuleFieldChange,
} from 'src/engine/metadata-modules/validation-rule/utils/compute-validation-rule-after-field-change.util';

const AMOUNT_UNIVERSAL_IDENTIFIER = 'amount-universal-identifier';
const COMPANY_UNIVERSAL_IDENTIFIER = 'company-universal-identifier';
const EMPLOYEES_UNIVERSAL_IDENTIFIER = 'employees-universal-identifier';
const STAGE_UNIVERSAL_IDENTIFIER = 'stage-universal-identifier';

const RULE = {
  expression: 'isDefined(amount)',
  bindings: { amount: AMOUNT_UNIVERSAL_IDENTIFIER },
  isActive: true,
  errorFieldMetadataUniversalIdentifier: null,
};

const NO_CHANGE: Omit<ValidationRuleFieldChange, 'fieldUniversalIdentifier'> = {
  newFieldName: null,
  shouldDisableRulesReadingField: false,
  shouldDetachErrorField: false,
};

const COMPANY_RULE = {
  ...RULE,
  expression: 'not isDefined(company) or company.employees > 10',
  bindings: {
    company: COMPANY_UNIVERSAL_IDENTIFIER,
    'company.employees': EMPLOYEES_UNIVERSAL_IDENTIFIER,
  },
};

describe('computeValidationRuleAfterFieldChange', () => {
  it('should rename a field in the expression and the bindings, leaving strings alone', () => {
    expect(
      computeValidationRuleAfterFieldChange({
        validationRule: {
          ...RULE,
          expression: 'amount.amountMicros > 0 and stage != "amount"',
          bindings: {
            amount: AMOUNT_UNIVERSAL_IDENTIFIER,
            stage: STAGE_UNIVERSAL_IDENTIFIER,
          },
        },
        fieldChange: {
          ...NO_CHANGE,
          fieldUniversalIdentifier: AMOUNT_UNIVERSAL_IDENTIFIER,
          newFieldName: 'dealValue',
        },
      }),
    ).toMatchObject({
      expression: 'dealValue.amountMicros > 0 and stage != "amount"',
      bindings: {
        dealValue: AMOUNT_UNIVERSAL_IDENTIFIER,
        stage: STAGE_UNIVERSAL_IDENTIFIER,
      },
    });
  });

  it('should rename a related-record field read through a relation', () => {
    expect(
      computeValidationRuleAfterFieldChange({
        validationRule: COMPANY_RULE,
        fieldChange: {
          ...NO_CHANGE,
          fieldUniversalIdentifier: EMPLOYEES_UNIVERSAL_IDENTIFIER,
          newFieldName: 'headcount',
        },
      }),
    ).toMatchObject({
      expression: 'not isDefined(company) or company.headcount > 10',
      bindings: {
        company: COMPANY_UNIVERSAL_IDENTIFIER,
        'company.headcount': EMPLOYEES_UNIVERSAL_IDENTIFIER,
      },
    });
  });

  it('should rename the relation itself in every path that goes through it', () => {
    expect(
      computeValidationRuleAfterFieldChange({
        validationRule: COMPANY_RULE,
        fieldChange: {
          ...NO_CHANGE,
          fieldUniversalIdentifier: COMPANY_UNIVERSAL_IDENTIFIER,
          newFieldName: 'account',
        },
      }),
    ).toMatchObject({
      expression: 'not isDefined(account) or account.employees > 10',
      bindings: {
        account: COMPANY_UNIVERSAL_IDENTIFIER,
        'account.employees': EMPLOYEES_UNIVERSAL_IDENTIFIER,
      },
    });
  });

  it('should disable a rule reading the field', () => {
    expect(
      computeValidationRuleAfterFieldChange({
        validationRule: RULE,
        fieldChange: {
          ...NO_CHANGE,
          fieldUniversalIdentifier: AMOUNT_UNIVERSAL_IDENTIFIER,
          shouldDisableRulesReadingField: true,
        },
      }).isActive,
    ).toBe(false);
  });

  it('should move errors shown on the field to the record level without disabling the rule', () => {
    expect(
      computeValidationRuleAfterFieldChange({
        validationRule: {
          ...RULE,
          expression: 'isDefined(stage)',
          bindings: { stage: STAGE_UNIVERSAL_IDENTIFIER },
          errorFieldMetadataUniversalIdentifier: AMOUNT_UNIVERSAL_IDENTIFIER,
        },
        fieldChange: {
          fieldUniversalIdentifier: AMOUNT_UNIVERSAL_IDENTIFIER,
          newFieldName: null,
          shouldDisableRulesReadingField: true,
          shouldDetachErrorField: true,
        },
      }),
    ).toMatchObject({
      isActive: true,
      errorFieldMetadataUniversalIdentifier: null,
    });
  });

  it('should return the same rule when it neither reads nor reports on the field', () => {
    expect(
      computeValidationRuleAfterFieldChange({
        validationRule: RULE,
        fieldChange: {
          fieldUniversalIdentifier: 'other-universal-identifier',
          newFieldName: 'renamed',
          shouldDisableRulesReadingField: true,
          shouldDetachErrorField: true,
        },
      }),
    ).toBe(RULE);
  });
});
