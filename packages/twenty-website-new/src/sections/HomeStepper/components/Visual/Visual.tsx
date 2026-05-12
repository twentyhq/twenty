'use client';

import { WebGlMount } from '@/lib/visual-runtime';
import { HomeStepperBackgroundIllustration } from '@/sections/HomeStepper/visuals/HomeStepperBackgroundIllustration';
import { StepperVisualFrame } from '../StepperVisualFrame';
import { StepperLottie } from './StepperLottie';

const HOME_STEPPER_BACKGROUND = '/images/home/stepper/download-worker.webp';
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
        <WebGlMount>
          <HomeStepperBackgroundIllustration />
        </WebGlMount>
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
