import { type ObjectValidationRule } from 'twenty-shared/types';

import {
  computeValidationRulesAfterFieldChange,
  type ValidationRuleFieldChange,
} from 'src/engine/metadata-modules/validation-rule/utils/compute-validation-rules-after-field-change.util';

const AMOUNT_UNIVERSAL_IDENTIFIER = 'amount-universal-identifier';
const COMPANY_UNIVERSAL_IDENTIFIER = 'company-universal-identifier';
const EMPLOYEES_UNIVERSAL_IDENTIFIER = 'employees-universal-identifier';

const buildRule = (
  overrides: Partial<ObjectValidationRule>,
): ObjectValidationRule => ({
  id: 'rule',
  name: 'Rule',
  description: null,
  icon: null,
  expression: 'isDefined(amount)',
  bindings: { amount: AMOUNT_UNIVERSAL_IDENTIFIER },
  message: 'Message',
  errorFieldMetadataId: null,
  isActive: true,
  ...overrides,
});

const NO_CHANGE: Omit<ValidationRuleFieldChange, 'fieldUniversalIdentifier'> = {
  fieldMetadataId: null,
  newFieldName: null,
  shouldDisableRulesReadingField: false,
  shouldDetachErrorField: false,
};

describe('computeValidationRulesAfterFieldChange', () => {
  it('should rename a field in the expression and the bindings, leaving strings alone', () => {
    const { validationRules, hasChanged } =
      computeValidationRulesAfterFieldChange({
        validationRules: [
          buildRule({
            expression: 'amount.amountMicros > 0 and stage != "amount"',
            bindings: {
              amount: AMOUNT_UNIVERSAL_IDENTIFIER,
              stage: 'stage-universal-identifier',
            },
          }),
        ],
        fieldChange: {
          ...NO_CHANGE,
          fieldUniversalIdentifier: AMOUNT_UNIVERSAL_IDENTIFIER,
          newFieldName: 'dealValue',
        },
      });

    expect(hasChanged).toBe(true);
    expect(validationRules[0]).toMatchObject({
      expression: 'dealValue.amountMicros > 0 and stage != "amount"',
      bindings: {
        dealValue: AMOUNT_UNIVERSAL_IDENTIFIER,
        stage: 'stage-universal-identifier',
      },
    });
  });

  it('should rename a related-record field read through a relation', () => {
    const { validationRules } = computeValidationRulesAfterFieldChange({
      validationRules: [
        buildRule({
          expression: 'not isDefined(company) or company.employees > 10',
          bindings: {
            company: COMPANY_UNIVERSAL_IDENTIFIER,
            'company.employees': EMPLOYEES_UNIVERSAL_IDENTIFIER,
          },
        }),
      ],
      fieldChange: {
        ...NO_CHANGE,
        fieldUniversalIdentifier: EMPLOYEES_UNIVERSAL_IDENTIFIER,
        newFieldName: 'headcount',
      },
    });

    expect(validationRules[0]).toMatchObject({
      expression: 'not isDefined(company) or company.headcount > 10',
      bindings: {
        company: COMPANY_UNIVERSAL_IDENTIFIER,
        'company.headcount': EMPLOYEES_UNIVERSAL_IDENTIFIER,
      },
    });
  });

  it('should rename the relation itself in every path that goes through it', () => {
    const { validationRules } = computeValidationRulesAfterFieldChange({
      validationRules: [
        buildRule({
          expression: 'not isDefined(company) or company.employees > 10',
          bindings: {
            company: COMPANY_UNIVERSAL_IDENTIFIER,
            'company.employees': EMPLOYEES_UNIVERSAL_IDENTIFIER,
          },
        }),
      ],
      fieldChange: {
        ...NO_CHANGE,
        fieldUniversalIdentifier: COMPANY_UNIVERSAL_IDENTIFIER,
        newFieldName: 'account',
      },
    });

    expect(validationRules[0]).toMatchObject({
      expression: 'not isDefined(account) or account.employees > 10',
      bindings: {
        account: COMPANY_UNIVERSAL_IDENTIFIER,
        'account.employees': EMPLOYEES_UNIVERSAL_IDENTIFIER,
      },
    });
  });

  it('should disable the rules reading the field and move its errors to the record', () => {
    const { validationRules, hasChanged } =
      computeValidationRulesAfterFieldChange({
        validationRules: [
          buildRule({ id: 'reads-amount' }),
          buildRule({
            id: 'reports-on-amount',
            expression: 'isDefined(stage)',
            bindings: { stage: 'stage-universal-identifier' },
            errorFieldMetadataId: 'amount-field-id',
          }),
        ],
        fieldChange: {
          fieldUniversalIdentifier: AMOUNT_UNIVERSAL_IDENTIFIER,
          fieldMetadataId: 'amount-field-id',
          newFieldName: null,
          shouldDisableRulesReadingField: true,
          shouldDetachErrorField: true,
        },
      });

    expect(hasChanged).toBe(true);
    expect(
      validationRules.map(({ id, isActive, errorFieldMetadataId }) => ({
        id,
        isActive,
        errorFieldMetadataId,
      })),
    ).toEqual([
      { id: 'reads-amount', isActive: false, errorFieldMetadataId: null },
      { id: 'reports-on-amount', isActive: true, errorFieldMetadataId: null },
    ]);
  });

  it('should report no change when no rule reads or reports on the field', () => {
    expect(
      computeValidationRulesAfterFieldChange({
        validationRules: [buildRule({})],
        fieldChange: {
          ...NO_CHANGE,
          fieldUniversalIdentifier: 'other-universal-identifier',
          newFieldName: 'renamed',
          shouldDisableRulesReadingField: true,
        },
      }).hasChanged,
    ).toBe(false);
  });
});
