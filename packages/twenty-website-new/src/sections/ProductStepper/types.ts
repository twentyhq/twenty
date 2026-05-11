import type { ImageType } from '@/design-system/components/Image';
import type { MessageDescriptor } from '@lingui/core';
import type { ReactNode } from 'react';

export type ProductStepperStepType = {
  body: MessageDescriptor;
  heading: ReactNode;
  icon: string;
  image: ImageType;
};
