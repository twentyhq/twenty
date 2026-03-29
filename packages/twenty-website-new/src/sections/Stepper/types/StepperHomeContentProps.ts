import type { StepperHomeStepType } from '@/sections/Stepper/types/StepperHomeStep';

export type StepperHomeContentProps = {
  activeImageIndex: number;
  activeStepIndex: number;
  onActiveStepChange: (index: number) => void;
  steps: StepperHomeStepType[];
};
