import { type MessageDescriptor } from '@lingui/core';

import { type INFORMATIVE_MARKS } from '@/icons';

import { type ProductStepperVisualKey } from './product-stepper-visual-key';

export type ProductStepperStep = {
  body: MessageDescriptor;
  heading: MessageDescriptor;
  icon: keyof typeof INFORMATIVE_MARKS;
  visual: ProductStepperVisualKey;
};
