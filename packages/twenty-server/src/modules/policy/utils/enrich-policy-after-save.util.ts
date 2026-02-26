import { isDefined } from 'twenty-shared/utils';

import type { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { lookupCarrierProductCommission } from 'src/modules/policy/utils/lookup-carrier-product-commission.util';

// Enriches policy records after save with bypassed permissions.
// Handles: LTV from CarrierProduct commission, submittedDate, agentId.
// These fields are set post-save because members may not have write
// permission on them — pre-query hooks would fail field-level checks.
export async function enrichPolicyAfterSave(
  records: Record<string, unknown>[],
  workspaceId: string,
  globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  options?: {
    submittedDate?: string;
    agentProfileId?: string | null;
  },
): Promise<void> {
  const policyRepo = await globalWorkspaceOrmManager.getRepository(
    workspaceId,
    'policy',
    { shouldBypassPermissionChecks: true },
  );

  for (const record of records) {
    const carrierId = record.carrierId as string | null | undefined;
    const productId = record.productId as string | null | undefined;
    const id = record.id as string;

    const updates: Record<string, unknown> = {};

    // Stamp LTV from CarrierProduct commission
    if (isDefined(carrierId) && isDefined(productId)) {
      const ltvCommission = await lookupCarrierProductCommission(
        carrierId,
        productId,
        workspaceId,
        globalWorkspaceOrmManager,
      );

      if (ltvCommission) {
        updates.ltv = {
          amountMicros: ltvCommission.amountMicros,
          currencyCode: ltvCommission.currencyCode,
        };
      }
    }

    // Auto-set submittedDate if not already set on the record
    if (options?.submittedDate && !isDefined(record.submittedDate)) {
      updates.submittedDate = options.submittedDate;
    }

    // Auto-assign agent profile if not already set on the record
    if (options?.agentProfileId && !isDefined(record.agentId)) {
      updates.agentId = options.agentProfileId;
    }

    if (Object.keys(updates).length > 0) {
      await policyRepo.update({ id }, updates as Record<string, unknown>);
    }
  }
}
