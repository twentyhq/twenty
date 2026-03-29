import type { BodyType } from '@/design-system/components/Body/types/Body';
import type { EyebrowType } from '@/design-system/components/Eyebrow/types/Eyebrow';
import type { HeadingType } from '@/design-system/components/Heading/types/Heading';
import type { StepperProductStepType } from '@/sections/Stepper/types/StepperProductStep';

export type StepperProductDataType = {
  eyebrow: EyebrowType;
  heading: HeadingType[];
  body: BodyType;
  steps: StepperProductStepType[];
};
