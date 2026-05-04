import type { MessageBody } from '@/lib/i18n/message-body';
import type { MessageEyebrow } from '@/lib/i18n/message-eyebrow';
import type { ProductStepperStepType } from '@/sections/ProductStepper/types/ProductStepperStep';

export type ProductStepperDataType = {
  body: MessageBody;
  eyebrow: MessageEyebrow;
  steps: ProductStepperStepType[];
};
