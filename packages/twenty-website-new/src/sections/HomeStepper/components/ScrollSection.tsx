'use client';

import type { HomeStepperStepType } from '@/sections/HomeStepper/types/home-stepper-step';
import { useRef } from 'react';
import { Flow } from './Flow';
import { Root } from './Root';

type ScrollSectionProps = {
  steps: HomeStepperStepType[];
};

export function ScrollSection({ steps }: ScrollSectionProps) {
  const scrollContainerRef = useRef<HTMLElement>(null);

  return (
    <Root scrollContainerRef={scrollContainerRef}>
      <Flow scrollContainerRef={scrollContainerRef} steps={steps} />
    </Root>
  );
}
