import { type MessageDescriptor } from '@lingui/core';
import { type ComponentType } from 'react';

import { type INFORMATIVE_MARKS } from '@/icons';

export type ProductStepperStep = {
  body: MessageDescriptor;
  heading: MessageDescriptor;
  icon: keyof typeof INFORMATIVE_MARKS;
  // progress: how far the reader has scrolled through this step (0 to 1),
  // given only while the stepper scrolls (md and up), like HomeStepper's
  // Lottie. Visuals may ignore it.
  Visual: ComponentType<{ active: boolean; progress?: number }>;
};
