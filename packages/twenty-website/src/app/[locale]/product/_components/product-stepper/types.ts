import type { InformativeIconKey } from '@/icons';
import type { MessageDescriptor } from '@lingui/core';
import type { ComponentType, ReactNode } from 'react';

export type StepperVisualProps = {
  active: boolean;
};

export type ProductStepperStepType = {
  body: MessageDescriptor;
  heading: ReactNode;
  icon: InformativeIconKey;
  visual: ComponentType<StepperVisualProps>;
};
