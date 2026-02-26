import { isDefined } from 'twenty-shared/utils';

import type { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';

// Builds a policy display name from carrier and product names.
// Pattern: "{Carrier} - {Product}", matching ingestion format.
export async function buildPolicyDisplayName(
  carrierId: string | null,
  productId: string | null,
  workspaceId: string,
  globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
): Promise<string | null> {
  let carrierName = '';
  let productName = '';

  if (isDefined(carrierId)) {
    const carrierRepo = await globalWorkspaceOrmManager.getRepository(
      workspaceId,
      'carrier',
      { shouldBypassPermissionChecks: true },
    );

    const carrier = (await carrierRepo.findOne({
      where: { id: carrierId },
    })) as Record<string, unknown> | null;

    carrierName = ((carrier?.name as string) ?? '').trim();
  }

  if (isDefined(productId)) {
    const productRepo = await globalWorkspaceOrmManager.getRepository(
      workspaceId,
      'product',
      { shouldBypassPermissionChecks: true },
    );

    const product = (await productRepo.findOne({
      where: { id: productId },
    })) as Record<string, unknown> | null;

    productName = ((product?.name as string) ?? '').trim();
  }

  if (carrierName && productName) {
    return `${carrierName} - ${productName}`;
  }

  if (carrierName) {
    return `${carrierName} - Unknown`;
  }

  if (productName) {
    return `Unknown - ${productName}`;
  }

  return null;
}
