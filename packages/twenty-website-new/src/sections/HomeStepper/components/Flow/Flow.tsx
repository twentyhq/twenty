'use client';

import type { HomeStepperStepType } from '@/sections/HomeStepper/types/HomeStepperStep';
import { useState, type RefObject } from 'react';
import { SyncScrollProgressFromContainerEffect } from '../../effect-components/SyncScrollProgressFromContainerEffect';
import { LeftColumn } from '../LeftColumn/LeftColumn';
import { RightColumn } from '../RightColumn/RightColumn';
import { Visual } from '../Visual/Visual';

type FlowProps = {
  scrollContainerRef: RefObject<HTMLElement | null>;
  steps: HomeStepperStepType[];
};

export function Flow({ scrollContainerRef, steps }: FlowProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  return (
    <>
      <SyncScrollProgressFromContainerEffect
        scrollContainerRef={scrollContainerRef}
        onScrollProgress={setScrollProgress}
      />
      <LeftColumn
        activeStepIndex={activeStepIndex}
        onActiveStepChange={setActiveStepIndex}
        scrollProgress={scrollProgress}
        steps={steps}
      />
      <RightColumn>
        <Visual />
      </RightColumn>
    </>
  );
}
