/* @license Enterprise */

import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { isValidationRuleEnforcementEnabled } from 'src/engine/twenty-orm/utils/is-validation-rule-enforcement-enabled.util';

describe('isValidationRuleEnforcementEnabled', () => {
  it('enforces rules on an Organization plan workspace', () => {
    expect(
      isValidationRuleEnforcementEnabled({
        billingEntitlements: { [BillingEntitlementKey.VALIDATION_RULES]: true },
        hasValidEnterprisePlan: true,
        isBillingEnabled: true,
      }),
    ).toBe(true);
  });

  it('enforces rules on a self-hosted instance with a valid Organization key', () => {
    expect(
      isValidationRuleEnforcementEnabled({
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
        billingEntitlements: {},
        hasValidEnterprisePlan: false,
        isBillingEnabled: false,
      },
    ],
  ])('stops enforcing rules when %s', (_label, input) => {
    expect(isValidationRuleEnforcementEnabled(input)).toBe(false);
  });
});
