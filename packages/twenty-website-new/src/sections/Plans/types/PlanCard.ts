import { type HeadingType } from '@/design-system/components/Heading/types/Heading';
import type { IllustrationId } from '@/illustrations';
import { type PlanFeaturesType } from '@/sections/Plans/types/PlanFeatures';
import { type PlanPriceType } from '@/sections/Plans/types/PlanPrice';

export type PlanCardType = {
  heading: HeadingType;
  price: PlanPriceType;
  illustration: IllustrationId;
  features: PlanFeaturesType;
};
