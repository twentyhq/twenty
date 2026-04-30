import type { BodyType } from '@/design-system/components/Body';
import type { HeadingType } from '@/design-system/components/Heading';
import type { LocalizableText } from '@/lib/i18n/localizable-text';

export type SalesforceWrongChoicePopupType = {
  body: LocalizableText;
  titleBar: LocalizableText;
};

export type SalesforceRichTextPartType = {
  strike?: boolean;
  text: LocalizableText;
};

export type SalesforceAddonTooltipType = {
  body: LocalizableText;
  title: LocalizableText;
};

export type SalesforceAddonRowType = {
  cost: number;
  defaultChecked?: boolean;
  disabled?: boolean;
  fixedCost?: number;
  id: string;
  label: LocalizableText;
  netSpendRate?: number;
  popup: SalesforceWrongChoicePopupType;
  rightLabelParts?: SalesforceRichTextPartType[][];
  rightLabel: LocalizableText;
  sharedCostKey?: string;
  tooltip?: SalesforceAddonTooltipType;
};

export type SalesforcePricingPanelType = {
  basePriceAmount: number;
  productIconAlt: string;
  productIconSrc: string;
  totalPriceLabel: LocalizableText;
  windowTitle: LocalizableText;
  productTitle: LocalizableText;
  priceSuffix: LocalizableText;
  promoTag?: LocalizableText;
  featureSectionHeading: LocalizableText;
  addons: SalesforceAddonRowType[];
  secondaryCtaNote?: LocalizableText;
  secondaryCtaHref: string;
  secondaryCtaLabel: LocalizableText;
};

export type SalesforceDataType = {
  heading: HeadingType[];
  body: BodyType;
  pricing: SalesforcePricingPanelType;
};
