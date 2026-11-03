/* @license Enterprise */

import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { type BillingEntitlements } from 'src/engine/core-modules/billing/types/billing-entitlements.type';
import { isEntitlementActive } from 'src/engine/core-modules/billing/utils/is-entitlement-active.util';

export const isValidationRuleEnforcementEnabled = ({
  billingEntitlements,
  hasValidEnterprisePlan,
  isBillingEnabled,
}: {
  billingEntitlements: BillingEntitlements;
  hasValidEnterprisePlan: boolean;
  isBillingEnabled: boolean;
}): boolean =>
  isEntitlementActive({
    key: BillingEntitlementKey.VALIDATION_RULES,
    hasValidEnterprisePlan,
    isBillingEnabled,
    stripeEntitlementValue:
      billingEntitlements[BillingEntitlementKey.VALIDATION_RULES] ?? false,
  });
