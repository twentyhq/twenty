import { type SalesfarceAddonRowType } from './salesfarce-types';

type SalesfarceAddonCost = Pick<
  SalesfarceAddonRowType,
  'cost' | 'fixedCost' | 'id' | 'netSpendRate' | 'sharedCostKey'
>;

export type SalesfarcePriceAmounts = {
  fixedPriceAmount: number;
  perSeatPriceAmount: number;
  totalPriceAmount: number;
};

export function calculatePriceAmounts(
  addons: readonly SalesfarceAddonCost[],
  basePriceAmount: number,
  checkedIds: ReadonlySet<string>,
): SalesfarcePriceAmounts {
  const appliedSharedCosts = new Set<string>();

  let perSeatBaseAmount = basePriceAmount;
  let fixedPriceAmount = 0;
  let netSpendRate = 0;

  for (const addon of addons) {
    if (!checkedIds.has(addon.id)) {
      continue;
    }

    if (
      addon.sharedCostKey !== undefined &&
      appliedSharedCosts.has(addon.sharedCostKey)
    ) {
      fixedPriceAmount += addon.fixedCost ?? 0;
      netSpendRate += addon.netSpendRate ?? 0;
      continue;
    }

    if (addon.sharedCostKey !== undefined) {
      appliedSharedCosts.add(addon.sharedCostKey);
    }

    perSeatBaseAmount += addon.cost;
    fixedPriceAmount += addon.fixedCost ?? 0;
    netSpendRate += addon.netSpendRate ?? 0;
  }

  const perSeatPriceAmount = perSeatBaseAmount * (1 + netSpendRate);
  const totalBaseAmount = perSeatBaseAmount + fixedPriceAmount;
  const totalPriceAmount = totalBaseAmount * (1 + netSpendRate);

  return { fixedPriceAmount, perSeatPriceAmount, totalPriceAmount };
}
