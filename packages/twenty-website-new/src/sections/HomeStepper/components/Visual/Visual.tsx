'use client';

import { StepperVisualFrame } from '../StepperVisualFrame/StepperVisualFrame';
import { StepperLottie } from './StepperLottie';

const HOME_STEPPER_BACKGROUND = '/images/home/stepper/background.png';
const HOME_STEPPER_SHAPE = '/images/home/stepper/background-shape.png';

type VisualProps = {
  scrollProgress: number;
};

export function Visual({ scrollProgress }: VisualProps) {
  return (
    <StepperVisualFrame
      backgroundSrc={HOME_STEPPER_BACKGROUND}
      shapeSrc={HOME_STEPPER_SHAPE}
    >
      <StepperLottie scrollProgress={scrollProgress} />
    </StepperVisualFrame>
  );
}
