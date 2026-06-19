import { type MessageDescriptor } from '@lingui/core';

export type SalesfarceWrongChoicePopupType = {
  body: MessageDescriptor;
  titleBar: MessageDescriptor;
};

export type SalesfarceRichTextPartType = {
  strike?: boolean;
  text: MessageDescriptor;
};

export type SalesfarceAddonTooltipType = {
  body: MessageDescriptor;
  title: MessageDescriptor;
};

export type SalesfarceAddonRowType = {
  cost: number;
  defaultChecked?: boolean;
  disabled?: boolean;
  fixedCost?: number;
  id: string;
  label: MessageDescriptor;
  netSpendRate?: number;
  popup: SalesfarceWrongChoicePopupType;
  rightLabel: MessageDescriptor;
  rightLabelParts?: SalesfarceRichTextPartType[][];
  sharedCostKey?: string;
  tooltip?: SalesfarceAddonTooltipType;
};

export type SalesfarcePricingPanelType = {
  addons: SalesfarceAddonRowType[];
  basePriceAmount: number;
  featureSectionHeading: MessageDescriptor;
  priceSuffix: MessageDescriptor;
  productIconAlt: string;
  productIconSrc: string;
  productTitle: MessageDescriptor;
  promoTag?: MessageDescriptor;
  secondaryCtaHref: string;
  secondaryCtaLabel: MessageDescriptor;
  secondaryCtaNote?: MessageDescriptor;
  totalPriceLabel: MessageDescriptor;
  windowTitle: MessageDescriptor;
};

export type SalesfarceDataType = {
  body: MessageDescriptor;
  pricing: SalesfarcePricingPanelType;
};
