import type { BodyType } from '@/design-system/components/Body/types/Body';
import type { HeadingType } from '@/design-system/components/Heading/types/Heading';

export type SalesforceWrongChoicePopupType = {
  body: string;
  titleBar: string;
};

export type SalesforceRichTextPartType = {
  strike?: boolean;
  text: string;
};

export type SalesforceAddonTooltipType = {
  body: string;
  title: string;
};

export type SalesforceAddonRowType = {
  cost: number;
  defaultChecked?: boolean;
  disabled?: boolean;
  fixedCost?: number;
  id: string;
  label: string;
  netSpendRate?: number;
  popup: SalesforceWrongChoicePopupType;
  rightLabelParts?: SalesforceRichTextPartType[][];
  rightLabel: string;
  sharedCostKey?: string;
  tooltip?: SalesforceAddonTooltipType;
};

export type SalesforcePricingPanelType = {
  basePriceAmount: number;
  productIconAlt: string;
  productIconSrc: string;
  totalPriceLabel: string;
  windowTitle: string;
  productTitle: string;
  priceSuffix: string;
  promoTag?: string;
  featureSectionHeading: string;
  addons: SalesforceAddonRowType[];
  secondaryCtaNote?: string;
  secondaryCtaHref: string;
  secondaryCtaLabel: string;
};

export type SalesforceDataType = {
  heading: HeadingType[];
  body: BodyType;
  pricing: SalesforcePricingPanelType;
};
