import type { BodyType } from '@/design-system/components/Body';
import type { HeadingType } from '@/design-system/components/Heading';
import type { LocalizableText } from '@/lib/i18n/localizable-text';
import type { PlansHostingMode, PlansTierId } from '@/sections/Plans/types';

export type PlanTableTierColumnType = {
  id: PlansTierId;
  label: LocalizableText;
};

export type PlanTableCellType =
  | { kind: 'dash' }
  | { kind: 'text'; text: LocalizableText }
  | { kind: 'yes'; label?: LocalizableText };

export type PlanTableCategoryRowDataType = {
  appliesTo?: PlansHostingMode;
  title: LocalizableText;
  type: 'category';
};

export type PlanTableFeatureRowDataType = {
  appliesTo?: PlansHostingMode;
  featureLabel: LocalizableText;
  selfHostTiers?: Record<PlansTierId, PlanTableCellType>;
  tiers: Record<PlansTierId, PlanTableCellType>;
  type: 'row';
};

export type PlanTableCalculatorSectionDataType = {
  id: string;
  modelField?: {
    label: LocalizableText;
    options: string[];
    value: string;
  };
  requestField: {
    label: LocalizableText;
    value: number;
  };
  tasksField: {
    label: LocalizableText;
    options: string[];
    value: string;
  };
  title: LocalizableText;
};

export type PlanTableCalculatorDataType = {
  priceLine: {
    amount: string;
    label: LocalizableText;
    periodSuffix: LocalizableText;
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
  featureColumnLabel: LocalizableText;
  initialVisibleRowCount: number;
  rows: PlanTableBodyRowDataType[];
  seeMoreFeaturesCta: {
    collapseLabel: LocalizableText;
    expandLabel: LocalizableText;
  };
  tierColumns: PlanTableTierColumnType[];
};
