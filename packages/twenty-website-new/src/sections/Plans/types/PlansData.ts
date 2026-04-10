import type { BodyType } from '@/design-system/components/Body/types/Body';
import type { HeadingType } from '@/design-system/components/Heading/types/Heading';
import type { IllustrationId } from '@/illustrations';
import type { PlanPriceType } from './PlanPrice';

// Same literals as UI toggles when reading cells.
export type PlansHostingMode = 'cloud' | 'selfHost';
export type PlansBillingPeriod = 'monthly' | 'yearly';
export type PlansTierId = 'pro' | 'organization';

// Varies per hosting × billing (eight leaves per tier).
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

// Shared across all eight combinations for this tier.
export type PlansTierType = {
  cells: PlansTierCellsType;
  featuresTitle: BodyType;
  heading: HeadingType;
  illustration: IllustrationId;
};

export type PlansDataType = {
  organization: PlansTierType;
  pro: PlansTierType;
};
