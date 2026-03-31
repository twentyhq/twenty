import type { HomeStepperStepType } from '@/sections/HomeStepper/types/HomeStepperStep';

export type HomeStepperContentProps = {
  activeImageIndex: number;
  activeStepIndex: number;
  onActiveStepChange: (index: number) => void;
  steps: HomeStepperStepType[];
};
