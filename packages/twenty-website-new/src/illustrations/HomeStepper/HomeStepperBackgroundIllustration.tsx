'use client';

import { StepperBackgroundHalftone } from '@/sections/HomeStepper/components/Visual/StepperBackgroundHalftone';

const HOME_STEPPER_BACKGROUND_IMAGE_URL = '/images/home/stepper/gears.jpg';

export function HomeStepperBackgroundIllustration() {
  return (
    <StepperBackgroundHalftone imageUrl={HOME_STEPPER_BACKGROUND_IMAGE_URL} />
  );
}
