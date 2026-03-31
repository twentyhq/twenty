import { HeadingType } from '@/design-system/components/Heading/types/Heading';
import { IllustrationType } from '@/design-system/components/Illustration/types/Illustration';
import { PlanFeaturesType } from '@/sections/Plans/types/PlanFeatures';
import { PlanPriceType } from '@/sections/Plans/types/PlanPrice';

export type PlanCardType = {
  heading: HeadingType;
  price: PlanPriceType;
  illustration: IllustrationType;
  features: PlanFeaturesType;
};
