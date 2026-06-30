import { msg } from '@lingui/core/macro';

import { type ProductStepperStep } from '../types/product-stepper-step';

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
