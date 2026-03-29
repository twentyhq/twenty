import type { BodyType } from '@/design-system/components/Body/types/Body';
import type { EyebrowType } from '@/design-system/components/Eyebrow/types/Eyebrow';
import type { HeadingType } from '@/design-system/components/Heading/types/Heading';
import type { StepperProductContentStepType } from '@/sections/Stepper/types/StepperProductContentStep';

export type StepperProductContentProps = {
  activeStepIndex: number;
  body: BodyType;
  eyebrow: EyebrowType;
  heading: HeadingType[];
  onStepSelect: (index: number) => void;
  steps: StepperProductContentStepType[];
};
