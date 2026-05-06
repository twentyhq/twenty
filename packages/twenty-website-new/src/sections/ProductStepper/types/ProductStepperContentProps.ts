import type { MessageBody } from '@/lib/i18n/message-body';
import type { MessageEyebrow } from '@/lib/i18n/message-eyebrow';
import type { ProductStepperContentStepType } from '@/sections/ProductStepper/types/ProductStepperContentStep';
import type { ReactNode } from 'react';

export type ProductStepperLayoutMode = 'scroll' | 'swipe';

export type ProductStepperContentProps = {
  activeStepIndex: number;
  body: MessageBody;
  eyebrow: MessageEyebrow;
  heading: ReactNode;
  layoutMode: ProductStepperLayoutMode;
  localProgress: number;
  onMobileStepIndexChange: (nextIndex: number) => void;
  steps: ProductStepperContentStepType[];
};
