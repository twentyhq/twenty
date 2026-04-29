import type { BodyType } from '@/design-system/components/Body';
import type { HeadingType } from '@/design-system/components/Heading';
import type { PlanIconType } from './PlanCard';
import type { PlanPriceType } from './PlanPrice';

export type PlansHostingMode = 'cloud' | 'selfHost';
export type PlansBillingPeriod = 'monthly' | 'yearly';
export type PlansTierId = 'pro' | 'organization';

export type PlansTierCellType = {
  featureBullets: BodyType[];
  price: PlanPriceType;
};

export type PlansTierBillingMatrixType = {
  monthly: PlansTierCellType;
  yearly: PlansTierCellType;
};

export type PlansTierCellsType = {
  cloud: PlansTierBillingMatrixType;
  selfHost: PlansTierBillingMatrixType;
};

export type PlansTierType = {
  cells: PlansTierCellsType;
  heading: HeadingType;
  icon: PlanIconType;
};

export type PlansDataType = {
  organization: PlansTierType;
  pro: PlansTierType;
};
