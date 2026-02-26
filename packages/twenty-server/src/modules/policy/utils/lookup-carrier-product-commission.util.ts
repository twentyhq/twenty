import type { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';

export async function lookupCarrierProductCommission(
  carrierId: string | null,
  productId: string | null,
  workspaceId: string,
  globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
): Promise<{ amountMicros: number; currencyCode: string } | null> {
  if (!carrierId || !productId) {
    return null;
  }

  let carrierProductRepo;

  try {
    carrierProductRepo = await globalWorkspaceOrmManager.getRepository(
      workspaceId,
      'carrierProduct',
      { shouldBypassPermissionChecks: true },
    );
  } catch (error) {
    console.error(
      '[lookupCarrierProductCommission] getRepository error:',
      error,
    );

    return null;
  }

  const carrierProducts = await carrierProductRepo.find({
    where: {
      carrierId,
      productId,
    },
  });

  // The workspace ORM returns CURRENCY composite fields as nested objects:
  // { commission: { amountMicros: number, currencyCode: string } }
  const carrierProduct =
    carrierProducts.find((cp: Record<string, unknown>) => {
      const commission = cp.commission as {
        amountMicros?: number | null;
      } | null;

      return commission?.amountMicros && commission.amountMicros > 0;
    }) ?? carrierProducts[0];

  if (!carrierProduct) {
    return null;
  }

  const record = carrierProduct as Record<string, unknown>;
  const commission = record.commission as {
    amountMicros?: number | null;
    currencyCode?: string | null;
  } | null;

  if (!commission?.amountMicros || commission.amountMicros <= 0) {
    return null;
  }

  return {
    amountMicros: commission.amountMicros,
    currencyCode: commission.currencyCode || 'USD',
  };
}
