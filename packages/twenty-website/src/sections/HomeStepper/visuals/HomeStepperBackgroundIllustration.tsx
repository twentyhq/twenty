'use client';

import { StepperBackgroundHalftone } from '@/sections/HomeStepper/components/Visual/StepperBackgroundHalftone';

const HOME_STEPPER_BACKGROUND_IMAGE_URL =
  '/images/home/stepper/download-worker.webp';

export function HomeStepperBackgroundIllustration() {
  return (
    <StepperBackgroundHalftone imageUrl={HOME_STEPPER_BACKGROUND_IMAGE_URL} />
  );
}
