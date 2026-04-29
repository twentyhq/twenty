import type { ProductStepperStepType } from '@/sections/ProductStepper/types/ProductStepperStep';

export type ProductStepperContentStepType = Omit<
  ProductStepperStepType,
  'image'
>;
