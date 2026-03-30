import type { HeroStepperStepType } from '@/sections/HeroStepper/types/HeroStepperStep';

export type HeroStepperContentProps = {
  activeImageIndex: number;
  activeStepIndex: number;
  onActiveStepChange: (index: number) => void;
  steps: HeroStepperStepType[];
};
