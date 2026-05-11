import type { MessageDescriptor } from '@lingui/core';
import type { ReactNode } from 'react';
import type { PlansHostingMode, PlansTierId } from '@/sections/Plans';

export type PlanTableTierColumnType = {
  id: PlansTierId;
  label: MessageDescriptor;
};

export type PlanTableCellType =
  | { kind: 'dash' }
  | { kind: 'text'; text: MessageDescriptor }
  | { kind: 'yes'; label?: MessageDescriptor };

export type PlanTableCategoryRowDataType = {
  appliesTo?: PlansHostingMode;
  title: MessageDescriptor;
  type: 'category';
};

export type PlanTableFeatureRowDataType = {
  appliesTo?: PlansHostingMode;
  featureLabel: MessageDescriptor;
  selfHostTiers?: Record<PlansTierId, PlanTableCellType>;
  tiers: Record<PlansTierId, PlanTableCellType>;
  type: 'row';
};

export type PlanTableCalculatorSectionDataType = {
  id: string;
  modelField?: {
    label: MessageDescriptor;
    options: string[];
    value: string;
  };
  requestField: {
    label: MessageDescriptor;
    value: number;
  };
  tasksField: {
    label: MessageDescriptor;
    options: string[];
    value: string;
  };
  title: MessageDescriptor;
};

export type PlanTableCalculatorDataType = {
  priceLine: {
    amount: string;
    label: MessageDescriptor;
    periodSuffix: MessageDescriptor;
  };
  sections: PlanTableCalculatorSectionDataType[];
  visual: {
    body: MessageDescriptor;
    heading: ReactNode;
    imageAlt?: string;
    imageSrc?: string;
  };
};

export type PlanTableCalculatorEmbedDataType = {
  calculator: PlanTableCalculatorDataType;
  type: 'calculator';
};

export type PlanTableBodyRowDataType =
  | PlanTableCalculatorEmbedDataType
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
