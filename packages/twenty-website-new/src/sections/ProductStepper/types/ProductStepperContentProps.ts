import type { MessageBody } from '@/lib/i18n/message-body';
import type { MessageEyebrow } from '@/lib/i18n/message-eyebrow';
import type { MessageHeadingSegment } from '@/lib/i18n/message-heading-segment';
import type { ProductStepperContentStepType } from '@/sections/ProductStepper/types/ProductStepperContentStep';

export type ProductStepperLayoutMode = 'scroll' | 'swipe';

export type ProductStepperContentProps = {
  activeStepIndex: number;
  body: MessageBody;
  eyebrow: MessageEyebrow;
  heading: MessageHeadingSegment[];
  layoutMode: ProductStepperLayoutMode;
  localProgress: number;
  onMobileStepIndexChange: (nextIndex: number) => void;
  steps: ProductStepperContentStepType[];
};
