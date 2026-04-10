import type { BodyType } from '@/design-system/components/Body/types/Body';
import type { HeadingType } from '@/design-system/components/Heading/types/Heading';
import type { PlansTierId } from '@/sections/Plans/types';

export type PlanTableTierColumnType = {
  id: PlansTierId;
  label: string;
};

export type PlanTableCellType =
  | { kind: 'dash' }
  | { kind: 'text'; text: string }
  | { kind: 'yes'; label?: string };

export type PlanTableCategoryRowDataType = {
  title: string;
  type: 'category';
};

export type PlanTableFeatureRowDataType = {
  featureLabel: string;
  tiers: Record<PlansTierId, PlanTableCellType>;
  type: 'row';
};

export type PlanTableCalculatorSectionDataType = {
  id: string;
  modelField?: {
    label: string;
    options: string[];
    value: string;
  };
  requestField: {
    label: string;
    value: number;
  };
  tasksField: {
    label: string;
    options: string[];
    value: string;
  };
  title: string;
};

export type PlanTableCalculatorDataType = {
  priceLine: {
    amount: string;
    label: string;
    periodSuffix: string;
  };
  sections: PlanTableCalculatorSectionDataType[];
  visual: {
    body: BodyType;
    heading: HeadingType[];
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
  featureColumnLabel: string;
  initialVisibleRowCount: number;
  rows: PlanTableBodyRowDataType[];
  seeMoreFeaturesCta: {
    collapseLabel: string;
    expandLabel: string;
  };
  tierColumns: PlanTableTierColumnType[];
};
