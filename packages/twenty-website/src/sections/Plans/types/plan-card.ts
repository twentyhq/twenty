import type { MessageDescriptor } from '@lingui/core';
import type { ImageType } from '@/design-system/components/Image';
import { type PlanFeaturesType } from '@/sections/Plans/types/plan-features';
import { type PlanPriceType } from '@/sections/Plans/types/plan-price';

export type PlanIconType = ImageType & {
  width?: number;
};

export type PlanCardType = {
  heading: MessageDescriptor;
  price: PlanPriceType;
  icon: PlanIconType;
  features: PlanFeaturesType;
};
