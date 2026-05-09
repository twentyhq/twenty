'use client';

import { ScrollProgressEffect } from '@/lib/scroll';
import { useStepperMdUp } from '@/sections/Stepper';
import { useBreakpointStepSync } from '@/sections/Stepper/use-breakpoint-step-sync';
import type { HomeStepperStepType } from '@/sections/HomeStepper/types/home-stepper-step';
import { useState, type RefObject } from 'react';
import { LeftColumn } from './LeftColumn';
import { RightColumn } from './RightColumn';
import { Visual } from './Visual/Visual';

type FlowProps = {
  scrollContainerRef: RefObject<HTMLElement | null>;
  steps: HomeStepperStepType[];
};

export function Flow({ scrollContainerRef, steps }: FlowProps) {
  const isMdUp = useStepperMdUp();
  const [scrollProgress, setScrollProgress] = useState(0);
  const {
    activeStepIndex,
    localProgress,
    mobileStepIndex,
    setMobileStepIndex,
  } = useBreakpointStepSync(isMdUp, scrollProgress, steps.length);

  const visualScrollProgress = isMdUp
    ? scrollProgress
    : (mobileStepIndex + 0.5) / steps.length;

  return (
    <>
      <ScrollProgressEffect
        scrollContainerRef={scrollContainerRef}
        onScrollProgress={setScrollProgress}
        enabled={isMdUp}
      />
      <LeftColumn
        activeStepIndex={activeStepIndex}
        layoutMode={isMdUp ? 'scroll' : 'swipe'}
        localProgress={localProgress}
        onMobileStepIndexChange={setMobileStepIndex}
        steps={steps}
      />
      <RightColumn>
        <Visual scrollProgress={visualScrollProgress} />
      </RightColumn>
    </>
  );
}
