'use client';

import { IllustrationMount } from '@/illustrations';
import { StepperVisualFrame } from '../StepperVisualFrame/StepperVisualFrame';
import { StepperLottie } from './StepperLottie';

const HOME_STEPPER_BACKGROUND =
  '/images/home/stepper/download-worker.webp';
const HOME_STEPPER_SHAPE = '/images/home/stepper/background-shape.webp';

type VisualProps = {
  scrollProgress: number;
};

export function Visual({ scrollProgress }: VisualProps) {
  return (
    <StepperVisualFrame
      backgroundColor="#424242"
      backgroundSrc={HOME_STEPPER_BACKGROUND}
      backgroundOverlay={
        <IllustrationMount illustration="homeStepperBackgroundHalftone" />
      }
      borderColor="#DBDBDB"
      showBackgroundImage={false}
      showShapeOverlay={false}
      shapeSrc={HOME_STEPPER_SHAPE}
    >
      <StepperLottie scrollProgress={scrollProgress} />
    </StepperVisualFrame>
  );
}
