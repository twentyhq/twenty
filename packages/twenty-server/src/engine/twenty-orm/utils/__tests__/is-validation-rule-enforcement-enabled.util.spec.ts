/* @license Enterprise */

import { FeatureFlagKey } from 'twenty-shared/types';

import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { isValidationRuleEnforcementEnabled } from 'src/engine/twenty-orm/utils/is-validation-rule-enforcement-enabled.util';

const FLAG_ON = { [FeatureFlagKey.IS_RECORD_CREATION_FORM_ENABLED]: true };

describe('isValidationRuleEnforcementEnabled', () => {
  it('enforces rules on an Organization plan workspace', () => {
    expect(
      isValidationRuleEnforcementEnabled({
        featureFlagsMap: FLAG_ON,
        billingEntitlements: { [BillingEntitlementKey.VALIDATION_RULES]: true },
        hasValidEnterprisePlan: true,
        isBillingEnabled: true,
      }),
    ).toBe(true);
  });

  it('enforces rules on a self-hosted instance with a valid Organization key', () => {
    expect(
      isValidationRuleEnforcementEnabled({
        featureFlagsMap: FLAG_ON,
        billingEntitlements: {},
        hasValidEnterprisePlan: true,
        isBillingEnabled: false,
      }),
    ).toBe(true);
  });

  it.each([
    [
      'the workspace plan does not include them',
      {
        featureFlagsMap: FLAG_ON,
        billingEntitlements: {
          [BillingEntitlementKey.VALIDATION_RULES]: false,
        },
        hasValidEnterprisePlan: true,
        isBillingEnabled: true,
      },
    ],
    [
      'the Organization key is not valid',
      {
        featureFlagsMap: FLAG_ON,
        billingEntitlements: {},
        hasValidEnterprisePlan: false,
        isBillingEnabled: false,
      },
    ],
    [
      'the feature flag is off',
      {
        featureFlagsMap: {},
        billingEntitlements: { [BillingEntitlementKey.VALIDATION_RULES]: true },
        hasValidEnterprisePlan: true,
        isBillingEnabled: true,
      },
    ],
  ])('stops enforcing rules when %s', (_label, input) => {
    expect(isValidationRuleEnforcementEnabled(input)).toBe(false);
  });
});
