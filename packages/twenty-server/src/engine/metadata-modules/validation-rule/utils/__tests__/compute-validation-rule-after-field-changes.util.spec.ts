/* @license Enterprise */

import { type ValidationRuleFieldChange } from 'src/engine/metadata-modules/validation-rule/types/validation-rule-field-change.type';
import { computeValidationRuleAfterFieldChanges } from 'src/engine/metadata-modules/validation-rule/utils/compute-validation-rule-after-field-changes.util';

const AMOUNT_UNIVERSAL_IDENTIFIER = 'amount-universal-identifier';
const COMPANY_UNIVERSAL_IDENTIFIER = 'company-universal-identifier';
const EMPLOYEES_UNIVERSAL_IDENTIFIER = 'employees-universal-identifier';
const STAGE_UNIVERSAL_IDENTIFIER = 'stage-universal-identifier';

// stage != "CUSTOMER" or not isEmpty(amount)
const RULE = {
  tree: {
    type: 'GROUP',
    logicalOperator: 'OR',
    children: [
      {
        type: 'COMPARISON',
        operator: 'NOT_EQUAL',
        left: {
          type: 'FIELD',
          fieldUniversalIdentifier: STAGE_UNIVERSAL_IDENTIFIER,
        },
        right: { type: 'LITERAL', value: 'CUSTOMER' },
      },
      {
        type: 'NOT',
        child: {
          type: 'FUNCTION_CALL',
          functionName: 'isEmpty',
          arguments: [
            {
              type: 'FIELD',
              fieldUniversalIdentifier: AMOUNT_UNIVERSAL_IDENTIFIER,
            },
          ],
        },
      },
    ],
  },
  isActive: true,
  errorFieldMetadataUniversalIdentifier: AMOUNT_UNIVERSAL_IDENTIFIER,
};

// company.employees > 10
const COMPANY_RULE = {
  ...RULE,
  tree: {
    type: 'COMPARISON',
    operator: 'GREATER_THAN',
    left: {
      type: 'FIELD',
      relationFieldUniversalIdentifier: COMPANY_UNIVERSAL_IDENTIFIER,
      fieldUniversalIdentifier: EMPLOYEES_UNIVERSAL_IDENTIFIER,
    },
    right: { type: 'LITERAL', value: 10 },
  },
  errorFieldMetadataUniversalIdentifier: null,
};

// previous.stage != "WON"
const PREVIOUS_STAGE_RULE = {
  ...COMPANY_RULE,
  tree: {
    type: 'COMPARISON',
    operator: 'NOT_EQUAL',
    left: {
      type: 'FIELD',
      fieldUniversalIdentifier: STAGE_UNIVERSAL_IDENTIFIER,
      isPreviousValue: true,
    },
    right: { type: 'LITERAL', value: 'WON' },
  },
};

const rename = (
  fieldUniversalIdentifier: string,
  newFieldName: string,
): ValidationRuleFieldChange => ({
  fieldUniversalIdentifier,
  newFieldName,
  shouldDisableRulesReadingField: false,
  isDeleted: false,
});

const retype = (
  fieldUniversalIdentifier: string,
): ValidationRuleFieldChange => ({
  fieldUniversalIdentifier,
  newFieldName: null,
  shouldDisableRulesReadingField: true,
  isDeleted: false,
});

const deletion = (
  fieldUniversalIdentifier: string,
): ValidationRuleFieldChange => ({
  fieldUniversalIdentifier,
  newFieldName: null,
  shouldDisableRulesReadingField: true,
  isDeleted: true,
});

describe('computeValidationRuleAfterFieldChanges', () => {
  it('should leave the rule as it is when a field it reads is renamed', () => {
    expect(
      computeValidationRuleAfterFieldChanges({
        validationRule: RULE,
        fieldChanges: [
          rename(AMOUNT_UNIVERSAL_IDENTIFIER, 'dealValue'),
          rename(STAGE_UNIVERSAL_IDENTIFIER, 'amount'),
        ],
      }),
    ).toBe(RULE);
    expect(
      computeValidationRuleAfterFieldChanges({
        validationRule: COMPANY_RULE,
        fieldChanges: [
          rename(COMPANY_UNIVERSAL_IDENTIFIER, 'account'),
          rename(EMPLOYEES_UNIVERSAL_IDENTIFIER, 'headcount'),
        ],
      }),
    ).toBe(COMPANY_RULE);
  });

  it('should disable the rule when a field it reads is renamed to a reserved word', () => {
    for (const reservedName of ['now', 'isDefined', 'true']) {
      expect(
        computeValidationRuleAfterFieldChanges({
          validationRule: RULE,
          fieldChanges: [rename(STAGE_UNIVERSAL_IDENTIFIER, reservedName)],
        }),
      ).toEqual({ ...RULE, isActive: false });
    }

    expect(
      computeValidationRuleAfterFieldChanges({
        validationRule: COMPANY_RULE,
        fieldChanges: [rename(COMPANY_UNIVERSAL_IDENTIFIER, 'now')],
      }),
    ).toEqual({ ...COMPANY_RULE, isActive: false });
  });

  it('should only disable for names reserved after a dot when the field is read after one', () => {
    expect(
      computeValidationRuleAfterFieldChanges({
        validationRule: COMPANY_RULE,
        fieldChanges: [rename(EMPLOYEES_UNIVERSAL_IDENTIFIER, 'now')],
      }),
    ).toBe(COMPANY_RULE);
    expect(
      computeValidationRuleAfterFieldChanges({
        validationRule: PREVIOUS_STAGE_RULE,
        fieldChanges: [rename(STAGE_UNIVERSAL_IDENTIFIER, 'now')],
      }),
    ).toBe(PREVIOUS_STAGE_RULE);
    expect(
      computeValidationRuleAfterFieldChanges({
        validationRule: COMPANY_RULE,
        fieldChanges: [rename(EMPLOYEES_UNIVERSAL_IDENTIFIER, 'and')],
      }),
    ).toEqual({ ...COMPANY_RULE, isActive: false });
  });

  it('should disable the rule when a field it reads changes type', () => {
    expect(
      computeValidationRuleAfterFieldChanges({
        validationRule: COMPANY_RULE,
        fieldChanges: [retype(EMPLOYEES_UNIVERSAL_IDENTIFIER)],
      }),
    ).toEqual({ ...COMPANY_RULE, isActive: false });
  });

  it('should disable the rule and move its errors to the record level when the error field it reads is deleted', () => {
    expect(
      computeValidationRuleAfterFieldChanges({
        validationRule: RULE,
        fieldChanges: [
          rename(STAGE_UNIVERSAL_IDENTIFIER, 'phase'),
          deletion(AMOUNT_UNIVERSAL_IDENTIFIER),
        ],
      }),
    ).toEqual({
      ...RULE,
      isActive: false,
      errorFieldMetadataUniversalIdentifier: null,
    });
  });

  it('should move errors shown on the field to the record level without disabling a rule that does not read it', () => {
    expect(
      computeValidationRuleAfterFieldChanges({
        validationRule: {
          ...COMPANY_RULE,
          errorFieldMetadataUniversalIdentifier: AMOUNT_UNIVERSAL_IDENTIFIER,
        },
        fieldChanges: [deletion(AMOUNT_UNIVERSAL_IDENTIFIER)],
      }),
    ).toMatchObject({
      isActive: true,
      errorFieldMetadataUniversalIdentifier: null,
    });
  });

  it('should leave a rule without a tree active', () => {
    const draftRule = { ...RULE, tree: null };

    expect(
      computeValidationRuleAfterFieldChanges({
        validationRule: draftRule,
        fieldChanges: [retype(STAGE_UNIVERSAL_IDENTIFIER)],
      }),
    ).toBe(draftRule);
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
