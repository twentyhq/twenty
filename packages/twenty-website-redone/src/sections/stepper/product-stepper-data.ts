import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { type INFORMATIVE_MARKS } from '@/icons';

export type ProductStepperVisualKey = 'dataModel' | 'layout' | 'workflow';

export type ProductStepperStep = {
  body: MessageDescriptor;
  heading: MessageDescriptor;
  icon: keyof typeof INFORMATIVE_MARKS;
  visual: ProductStepperVisualKey;
};

export const PRODUCT_STEPPER_STEPS: readonly ProductStepperStep[] = [
  {
    icon: 'users',
    heading: msg`Data model`,
    body: msg`Add objects and fields`,
    visual: 'dataModel',
  },
  {
    icon: 'check',
    heading: msg`Automation`,
    body: msg`Create a workflow`,
    visual: 'workflow',
  },
  {
    icon: 'eye',
    heading: msg`Layout`,
    body: msg`Tailor record pages, menus, and views`,
    visual: 'layout',
  },
];
