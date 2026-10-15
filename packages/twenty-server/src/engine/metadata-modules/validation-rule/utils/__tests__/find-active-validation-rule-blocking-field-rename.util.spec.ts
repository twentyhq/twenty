/* @license Enterprise */

import { findActiveValidationRuleBlockingFieldRename } from 'src/engine/metadata-modules/validation-rule/utils/find-active-validation-rule-blocking-field-rename.util';

const STAGE_UNIVERSAL_IDENTIFIER = 'stage-universal-identifier';
const WORKSPACE_APPLICATION_UNIVERSAL_IDENTIFIER = 'workspace-application';
const OTHER_APPLICATION_UNIVERSAL_IDENTIFIER = 'other-application';
const EMPLOYEES_UNIVERSAL_IDENTIFIER = 'employees-universal-identifier';

const STAGE_RULE = {
  name: 'Won needs an amount',
  bindings: { stage: STAGE_UNIVERSAL_IDENTIFIER },
  isActive: true,
  applicationUniversalIdentifier: WORKSPACE_APPLICATION_UNIVERSAL_IDENTIFIER,
};

const COMPANY_RULE = {
  name: 'Big companies only',
  bindings: {
    company: 'company-universal-identifier',
    'company.employees': EMPLOYEES_UNIVERSAL_IDENTIFIER,
  },
  isActive: true,
  applicationUniversalIdentifier: WORKSPACE_APPLICATION_UNIVERSAL_IDENTIFIER,
};

describe('findActiveValidationRuleBlockingFieldRename', () => {
  it('should return the active rule reading a field renamed to a reserved word', () => {
    for (const reservedName of ['now', 'isDefined', 'true', 'length']) {
      expect(
        findActiveValidationRuleBlockingFieldRename({
          validationRules: [COMPANY_RULE, STAGE_RULE],
          fieldUniversalIdentifier: STAGE_UNIVERSAL_IDENTIFIER,
          newFieldName: reservedName,
          applicationUniversalIdentifier:
            WORKSPACE_APPLICATION_UNIVERSAL_IDENTIFIER,
        }),
      ).toBe(STAGE_RULE);
    }
  });

  it('should ignore inactive rules', () => {
    expect(
      findActiveValidationRuleBlockingFieldRename({
        validationRules: [{ ...STAGE_RULE, isActive: false }],
        fieldUniversalIdentifier: STAGE_UNIVERSAL_IDENTIFIER,
        newFieldName: 'now',
        applicationUniversalIdentifier:
          WORKSPACE_APPLICATION_UNIVERSAL_IDENTIFIER,
      }),
    ).toBeUndefined();
  });

  it('should ignore rules owned by another application than the one renaming the field', () => {
    expect(
      findActiveValidationRuleBlockingFieldRename({
        validationRules: [STAGE_RULE],
        fieldUniversalIdentifier: STAGE_UNIVERSAL_IDENTIFIER,
        newFieldName: 'now',
        applicationUniversalIdentifier: OTHER_APPLICATION_UNIVERSAL_IDENTIFIER,
      }),
    ).toBeUndefined();
  });

  it('should allow a name that is only reserved at the start of a path for a related-record field', () => {
    expect(
      findActiveValidationRuleBlockingFieldRename({
        validationRules: [COMPANY_RULE],
        fieldUniversalIdentifier: EMPLOYEES_UNIVERSAL_IDENTIFIER,
        newFieldName: 'now',
        applicationUniversalIdentifier:
          WORKSPACE_APPLICATION_UNIVERSAL_IDENTIFIER,
      }),
    ).toBeUndefined();
  });

  it('should allow renames that are not reserved words or fields no rule reads', () => {
    expect(
      findActiveValidationRuleBlockingFieldRename({
        validationRules: [STAGE_RULE],
        fieldUniversalIdentifier: STAGE_UNIVERSAL_IDENTIFIER,
        newFieldName: 'dealStage',
        applicationUniversalIdentifier:
          WORKSPACE_APPLICATION_UNIVERSAL_IDENTIFIER,
      }),
    ).toBeUndefined();
    expect(
      findActiveValidationRuleBlockingFieldRename({
        validationRules: [STAGE_RULE],
        fieldUniversalIdentifier: EMPLOYEES_UNIVERSAL_IDENTIFIER,
        newFieldName: 'now',
        applicationUniversalIdentifier:
          WORKSPACE_APPLICATION_UNIVERSAL_IDENTIFIER,
      }),
    ).toBeUndefined();
  });
});
