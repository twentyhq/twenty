'use client';

import { VisibleWhenTabActive } from '@/components/VisibleWhenTabActive';

import { StepperVisualFrame } from '../StepperVisualFrame/StepperVisualFrame';
import { StepperBackgroundHalftone } from './StepperBackgroundHalftone';
import { StepperLottie } from './StepperLottie';

const HOME_STEPPER_BACKGROUND = '/images/home/stepper/gears.jpg';
const HOME_STEPPER_SHAPE = '/images/home/stepper/background-shape.webp';

type VisualProps = {
  scrollProgress: number;
};

export function Visual({ scrollProgress }: VisualProps) {
  return (
    <StepperVisualFrame
      backgroundColor="#F5F5F5"
      backgroundSrc={HOME_STEPPER_BACKGROUND}
      backgroundOverlay={
        <VisibleWhenTabActive>
          <StepperBackgroundHalftone imageUrl={HOME_STEPPER_BACKGROUND} />
        </VisibleWhenTabActive>
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
