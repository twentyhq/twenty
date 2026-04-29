import type { BodyType } from '@/design-system/components/Body';
import type { EyebrowType } from '@/design-system/components/Eyebrow';
import type { HeadingType } from '@/design-system/components/Heading';
import type { ProductStepperStepType } from '@/sections/ProductStepper/types/ProductStepperStep';

export type ProductStepperDataType = {
  body: BodyType;
  eyebrow: EyebrowType;
  heading: HeadingType[];
  steps: ProductStepperStepType[];
};
