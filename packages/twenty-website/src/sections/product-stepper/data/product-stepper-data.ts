import { msg } from '@lingui/core/macro';

import { DataModelVisual } from '../DataModelVisual';
import { LayoutVisual } from '../LayoutVisual';
import { WorkflowVisual } from '../WorkflowVisual';
import { type ProductStepperStep } from '../types/product-stepper-step';

export const PRODUCT_STEPPER_STEPS: readonly ProductStepperStep[] = [
  {
    icon: 'users',
    heading: msg`Data model`,
    body: msg`Add objects and fields`,
    Visual: DataModelVisual,
  },
  {
    icon: 'check',
    heading: msg`Automation`,
    body: msg`Create a workflow`,
    Visual: WorkflowVisual,
  },
  {
    icon: 'eye',
    heading: msg`Layout`,
    body: msg`Tailor record pages, menus, and views`,
    Visual: LayoutVisual,
  },
];
