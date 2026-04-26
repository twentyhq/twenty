import { type HeadingType } from '@/design-system/components/Heading';
import type { ImageType } from '@/design-system/components/Image';
import { type PlanFeaturesType } from '@/sections/Plans/types/PlanFeatures';
import { type PlanPriceType } from '@/sections/Plans/types/PlanPrice';

export type PlanIconType = ImageType & {
  width?: number;
};

export type PlanCardType = {
  heading: HeadingType;
  price: PlanPriceType;
  icon: PlanIconType;
  features: PlanFeaturesType;
};
