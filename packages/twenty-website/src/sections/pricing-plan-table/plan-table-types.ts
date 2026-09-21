import { type MessageDescriptor } from '@lingui/core';

import { type PlansHostingMode } from '@/pricing-state';

export type PlanTableTierId = 'enterprise' | 'organization' | 'pro';

export type PlanTableCellType =
  | { kind: 'dash' }
  | { kind: 'text'; text: MessageDescriptor }
  | { kind: 'yes'; label?: MessageDescriptor };

export type PlanTableTierColumnType = {
  id: PlanTableTierId;
  label: Record<PlansHostingMode, MessageDescriptor>;
};

export type PlanTableCategoryRowDataType = {
  appliesTo?: PlansHostingMode;
  title: MessageDescriptor;
  type: 'category';
};

export type PlanTableFeatureRowDataType = {
  appliesTo?: PlansHostingMode;
  featureLabel: MessageDescriptor;
  selfHostTiers?: Partial<Record<PlanTableTierId, PlanTableCellType>>;
  tiers: Partial<Record<PlanTableTierId, PlanTableCellType>>;
  type: 'row';
};

export type PlanTableBodyRowDataType =
  | PlanTableCategoryRowDataType
  | PlanTableFeatureRowDataType;

export type PlanTableDataType = {
  featureColumnLabel: MessageDescriptor;
  initialVisibleRowCount: number;
  rows: PlanTableBodyRowDataType[];
  seeMoreFeaturesCta: {
    collapseLabel: MessageDescriptor;
    expandLabel: MessageDescriptor;
  };
  tierColumns: PlanTableTierColumnType[];
};
