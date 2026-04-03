import { StepperProgressRail } from '@/design-system/components';
import type { HomeStepperStepType } from '../../types/HomeStepperStep';

type ProgressBarProps = {
  activeStepIndex: number;
  scrollProgress: number;
  steps: HomeStepperStepType[];
};

export function ProgressBar({
  activeStepIndex,
  scrollProgress,
  steps,
}: ProgressBarProps) {
  return (
    <StepperProgressRail
      activeStepIndex={activeStepIndex}
      scrollProgress={scrollProgress}
      stepCount={steps.length}
    />
  );
}
