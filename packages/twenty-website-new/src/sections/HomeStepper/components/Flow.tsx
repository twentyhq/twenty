'use client';

import { ScrollProgressEffect } from '@/lib/scroll';
import { useStepperMdUp } from '@/lib/stepper';
import type { HomeStepperStepType } from '@/sections/HomeStepper/types/HomeStepperStep';
import { useEffect, useRef, useState, type RefObject } from 'react';
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
  const [mobileStepIndex, setMobileStepIndex] = useState(0);
  const previousMdUpRef = useRef(isMdUp);

  useEffect(() => {
    if (previousMdUpRef.current && !isMdUp) {
      const scrollDerivedIndex = Math.min(
        steps.length - 1,
        Math.floor(scrollProgress * steps.length),
      );
      setMobileStepIndex(scrollDerivedIndex);
    }
    previousMdUpRef.current = isMdUp;
  }, [isMdUp, scrollProgress, steps.length]);

  const activeStepIndex = isMdUp
    ? Math.min(steps.length - 1, Math.floor(scrollProgress * steps.length))
    : mobileStepIndex;

  const localProgress = isMdUp
    ? scrollProgress * steps.length - activeStepIndex
    : 0;

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
