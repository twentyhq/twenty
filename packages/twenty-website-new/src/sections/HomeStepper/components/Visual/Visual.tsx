'use client';

import { StepperVisualFrame } from '../StepperVisualFrame/StepperVisualFrame';

const HOME_STEPPER_BACKGROUND = '/images/home/stepper/background.png';
const HOME_STEPPER_SHAPE = '/images/home/stepper/background-shape.png';

export function Visual() {
  return (
    <StepperVisualFrame
      backgroundSrc={HOME_STEPPER_BACKGROUND}
      shapeSrc={HOME_STEPPER_SHAPE}
    />
  );
}
