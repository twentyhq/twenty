import { StepperProgressRail } from '@/design-system/components';
import type { HomeStepperStepType } from './../types/home-stepper-step';

type ProgressBarProps = {
  activeStepIndex: number;
  localProgress: number;
  steps: HomeStepperStepType[];
};

export function ProgressBar({
  activeStepIndex,
  localProgress,
  steps,
}: ProgressBarProps) {
  return (
    <StepperProgressRail
      activeStepIndex={activeStepIndex}
      localProgress={localProgress}
      stepCount={steps.length}
    />
  );
}
