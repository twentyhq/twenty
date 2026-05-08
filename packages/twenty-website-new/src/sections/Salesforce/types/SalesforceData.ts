import type { MessageDescriptor } from '@lingui/core';

export type SalesforceWrongChoicePopupType = {
  body: MessageDescriptor;
  titleBar: MessageDescriptor;
};

export type SalesforceRichTextPartType = {
  strike?: boolean;
  text: MessageDescriptor;
};

export type SalesforceAddonTooltipType = {
  body: MessageDescriptor;
  title: MessageDescriptor;
};

export type SalesforceAddonRowType = {
  cost: number;
  defaultChecked?: boolean;
  disabled?: boolean;
  fixedCost?: number;
  id: string;
  label: MessageDescriptor;
  netSpendRate?: number;
  popup: SalesforceWrongChoicePopupType;
  rightLabelParts?: SalesforceRichTextPartType[][];
  rightLabel: MessageDescriptor;
  sharedCostKey?: string;
  tooltip?: SalesforceAddonTooltipType;
};

export type SalesforcePricingPanelType = {
  basePriceAmount: number;
  productIconAlt: string;
  productIconSrc: string;
  totalPriceLabel: MessageDescriptor;
  windowTitle: MessageDescriptor;
  productTitle: MessageDescriptor;
  priceSuffix: MessageDescriptor;
  promoTag?: MessageDescriptor;
  featureSectionHeading: MessageDescriptor;
  addons: SalesforceAddonRowType[];
  secondaryCtaNote?: MessageDescriptor;
  secondaryCtaHref: string;
  secondaryCtaLabel: MessageDescriptor;
};

export type SalesforceDataType = {
  body: MessageDescriptor;
  pricing: SalesforcePricingPanelType;
};
