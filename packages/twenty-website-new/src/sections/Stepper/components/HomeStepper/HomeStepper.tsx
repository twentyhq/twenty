'use client';

import type { StepperHomeStepType } from '@/sections/Stepper/types/StepperHomeStep';
import { useEffect, useState } from 'react';
import { HomeContent } from '../HomeContent/HomeContent';
import { HomeVisual } from '../HomeVisual/HomeVisual';
import { Root } from '../Root/Root';

type HomeStepperProps = {
  steps: StepperHomeStepType[];
};

export function HomeStepper({ steps }: HomeStepperProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [activeStepIndex]);

  useEffect(() => {
    const imageList = steps[activeStepIndex]?.images ?? [];
    if (imageList.length <= 1) {
      return;
    }
    const timerId = window.setInterval(() => {
      setActiveImageIndex(
        (previous) => (previous + 1) % imageList.length,
      );
    }, 5000);
    return () => window.clearInterval(timerId);
  }, [activeStepIndex, steps]);

  const images = steps[activeStepIndex]?.images ?? [];

  return (
    <Root>
      <HomeContent
        activeImageIndex={activeImageIndex}
        activeStepIndex={activeStepIndex}
        onActiveStepChange={setActiveStepIndex}
        steps={steps}
      />
      <HomeVisual activeImageIndex={activeImageIndex} images={images} />
    </Root>
  );
}
