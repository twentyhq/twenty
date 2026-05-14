import type { ImageType } from '@/design-system/components/Image';
import type { MessageDescriptor } from '@lingui/core';
import type { ComponentType, ReactNode } from 'react';

export type StepperVisualProps = {
  active: boolean;
};

export type ProductStepperStepType = {
  body: MessageDescriptor;
  heading: ReactNode;
  icon: string;
  image?: ImageType;
  visual?: ComponentType<StepperVisualProps>;
};
