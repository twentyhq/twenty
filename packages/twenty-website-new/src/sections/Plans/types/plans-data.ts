import type { MessageDescriptor } from '@lingui/core';
import type { PlanIconType } from './plan-card';
import type { PlanPriceType } from './plan-price';

export type PlansHostingMode = 'cloud' | 'selfHost';
export type PlansBillingPeriod = 'monthly' | 'yearly';
export type PlansTierId = 'pro' | 'organization';

export type PlansTierCellType = {
  featureBullets: MessageDescriptor[];
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
  heading: MessageDescriptor;
  icon: PlanIconType;
};

export type PlansDataType = {
  organization: PlansTierType;
  pro: PlansTierType;
};
