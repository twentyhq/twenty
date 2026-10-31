import { type MessageDescriptor } from '@lingui/core';

import { type PlansHostingMode } from '@/pricing-state';

export type PlanTableTierId = 'enterprise' | 'organization' | 'pro';

export type PlanTableCellType =
  | { kind: 'dash' }
  | {
      detail?: MessageDescriptor;
      kind: 'metric';
      prefix?: MessageDescriptor;
      unit: MessageDescriptor;
      value: MessageDescriptor;
    }
  | {
      detail?: MessageDescriptor;
      kind: 'text';
      suffix?: MessageDescriptor;
      text: MessageDescriptor;
    }
  | { kind: 'unlimited' }
  | { kind: 'yes'; label?: MessageDescriptor };

export type PlanTableTierColumnType = {
  highlighted?: boolean;
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
  tooltip?: MessageDescriptor;
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
