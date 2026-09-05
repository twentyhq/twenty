/* @license Enterprise */

import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { type BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { type EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';

export const hasRowLevelPermissionFeature = async ({
  workspaceId,
  billingService,
  enterprisePlanService,
}: {
  workspaceId: string;
  billingService: BillingService;
  enterprisePlanService: EnterprisePlanService;
}): Promise<boolean> => {
  const hasValidEnterprisePlan = enterprisePlanService.isValid();

  const isRowLevelPermissionEnabled = await billingService.hasEntitlement(
    workspaceId,
    BillingEntitlementKey.RLS,
  );

  return hasValidEnterprisePlan && isRowLevelPermissionEnabled;
};
