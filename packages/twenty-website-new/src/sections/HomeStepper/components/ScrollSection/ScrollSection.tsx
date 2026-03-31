'use client';

import type { HomeStepperStepType } from '@/sections/HomeStepper/types/HomeStepperStep';
import { useRef } from 'react';
import { Flow } from '../Flow/Flow';
import { Root } from '../Root/Root';

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
