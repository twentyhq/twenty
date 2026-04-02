import type { BodyType } from '@/design-system/components/Body/types/Body';
import type { HeadingType } from '@/design-system/components/Heading/types/Heading';
import type { SalesforcePopupKey } from '@/sections/Salesforce/constants';

export type SalesforceAddonRowType = {
  defaultChecked?: boolean;
  disabled?: boolean;
  id: string;
  label: string;
  popupKey: SalesforcePopupKey;
  rightLabel: string;
};

export type SalesforcePricingPanelType = {
  windowTitle: string;
  productTitle: string;
  priceAmount: string;
  priceSuffix: string;
  primaryCtaLabel: string;
  featureSectionHeading: string;
  addons: SalesforceAddonRowType[];
  secondaryCtaLabel: string;
};

export type SalesforceDataType = {
  heading: HeadingType[];
  body: BodyType;
  pricing: SalesforcePricingPanelType;
};
