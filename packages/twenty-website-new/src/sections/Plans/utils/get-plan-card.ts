import type { PlanCardType } from '@/sections/Plans/types/PlanCard';
import type {
  PlansBillingPeriod,
  PlansDataType,
  PlansHostingMode,
  PlansTierId,
} from '@/sections/Plans/types/PlansData';

export function getPlanCard(
  plansData: PlansDataType,
  tierId: PlansTierId,
  hosting: PlansHostingMode,
  billing: PlansBillingPeriod,
): PlanCardType {
  const tier = plansData[tierId];
  const cell = tier.cells[hosting][billing];

  return {
    heading: tier.heading,
    icon: tier.icon,
    price: cell.price,
    features: {
      bullets: cell.featureBullets,
    },
  };
}
