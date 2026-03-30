'use client';

import type { HeroStepperStepType } from '@/sections/HeroStepper/types/HeroStepperStep';
import { useEffect, useState } from 'react';
import { Content } from '../Content/Content';
import { Root } from '../Root/Root';
import { Visual } from '../Visual/Visual';

type FlowProps = {
  steps: HeroStepperStepType[];
};

export function Flow({ steps }: FlowProps) {
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
      setActiveImageIndex((previous) => (previous + 1) % imageList.length);
    }, 5000);
    return () => window.clearInterval(timerId);
  }, [activeStepIndex, steps]);

  const images = steps[activeStepIndex]?.images ?? [];

  return (
    <Root>
      <Content
        activeImageIndex={activeImageIndex}
        activeStepIndex={activeStepIndex}
        onActiveStepChange={setActiveStepIndex}
        steps={steps}
      />
      <Visual activeImageIndex={activeImageIndex} images={images} />
    </Root>
  );
}
