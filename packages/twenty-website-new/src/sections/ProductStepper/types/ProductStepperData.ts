import type { MessageBody } from '@/lib/i18n/message-body';
import type { MessageEyebrow } from '@/lib/i18n/message-eyebrow';
import type { MessageHeadingSegment } from '@/lib/i18n/message-heading-segment';
import type { ProductStepperStepType } from '@/sections/ProductStepper/types/ProductStepperStep';

export type ProductStepperDataType = {
  body: MessageBody;
  eyebrow: MessageEyebrow;
  heading: MessageHeadingSegment[];
  steps: ProductStepperStepType[];
};
