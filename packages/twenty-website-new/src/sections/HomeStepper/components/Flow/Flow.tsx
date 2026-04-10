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
  const [scrollProgress, setScrollProgress] = useState(0);

  const activeStepIndex = Math.min(
    steps.length - 1,
    Math.floor(scrollProgress * steps.length),
  );
  const localProgress = scrollProgress * steps.length - activeStepIndex;

  return (
    <>
      <SyncScrollProgressFromContainerEffect
        scrollContainerRef={scrollContainerRef}
        onScrollProgress={setScrollProgress}
      />
      <LeftColumn
        activeStepIndex={activeStepIndex}
        localProgress={localProgress}
        steps={steps}
      />
      <RightColumn>
        <Visual scrollProgress={scrollProgress} />
      </RightColumn>
    </>
  );
}
