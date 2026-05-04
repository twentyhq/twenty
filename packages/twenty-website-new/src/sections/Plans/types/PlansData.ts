import type { MessageBody } from '@/lib/i18n/message-body';
import type { MessageHeadingSegment } from '@/lib/i18n/message-heading-segment';
import type { PlanIconType } from './PlanCard';
import type { PlanPriceType } from './PlanPrice';

export type PlansHostingMode = 'cloud' | 'selfHost';
export type PlansBillingPeriod = 'monthly' | 'yearly';
export type PlansTierId = 'pro' | 'organization';

export type PlansTierCellType = {
  featureBullets: MessageBody[];
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
  heading: MessageHeadingSegment;
  icon: PlanIconType;
};

export type PlansDataType = {
  organization: PlansTierType;
  pro: PlansTierType;
};
