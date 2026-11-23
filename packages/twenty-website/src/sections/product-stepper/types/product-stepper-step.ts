import { type MessageDescriptor } from '@lingui/core';
import { type ComponentType } from 'react';

import { type INFORMATIVE_MARKS } from '@/icons';

export type ProductStepperStep = {
  body: MessageDescriptor;
  heading: MessageDescriptor;
  icon: keyof typeof INFORMATIVE_MARKS;
  Visual: ComponentType<{ active: boolean }>;
};
