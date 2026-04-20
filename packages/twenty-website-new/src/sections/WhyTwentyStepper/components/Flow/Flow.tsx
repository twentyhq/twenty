'use client';

import { IllustrationMount } from '@/illustrations';
import { useStepperMdUp } from '@/lib/stepper';
import { SyncScrollProgressFromContainerEffect } from '@/sections/WhyTwentyStepper/effect-components/SyncScrollProgressFromContainerEffect';
import type { WhyTwentyStepperDataType } from '@/sections/WhyTwentyStepper/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { useEffect, useRef, useState } from 'react';
import { Content } from '../Content/Content';
import { Root } from '../Root/Root';

const IllustrationColumn = styled.div`
  min-width: 0;
  width: 100%;

  @media (max-width: ${theme.breakpoints.md - 1}px) {
    order: -1;
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    align-self: start;
    max-width: 672px;
    position: sticky;
    top: calc(4.5rem + (100vh - 4.5rem) * 0.5 - 368px);
  }
`;

type FlowProps = WhyTwentyStepperDataType;

export function Flow({ body, heading, illustration }: FlowProps) {
  const isMdUp = useStepperMdUp();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileStepIndex, setMobileStepIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLElement>(null);
  const previousMdUpRef = useRef(isMdUp);

  const stepCount = body.length;

  useEffect(() => {
    if (previousMdUpRef.current && !isMdUp) {
      const scrollDerivedIndex = Math.min(
        stepCount - 1,
        Math.floor(scrollProgress * stepCount),
      );
      setMobileStepIndex(scrollDerivedIndex);
    }
    previousMdUpRef.current = isMdUp;
  }, [isMdUp, scrollProgress, stepCount]);

  const activeStepIndex = isMdUp
    ? Math.min(stepCount - 1, Math.floor(scrollProgress * stepCount))
    : mobileStepIndex;

  const localProgress = isMdUp
    ? scrollProgress * stepCount - activeStepIndex
    : 0;

  return (
    <Root scrollContainerRef={scrollContainerRef}>
      {isMdUp ? (
        <SyncScrollProgressFromContainerEffect
          onScrollProgress={setScrollProgress}
          scrollContainerRef={scrollContainerRef}
        />
      ) : null}
      <Content
        activeStepIndex={activeStepIndex}
        body={body}
        heading={heading}
        layoutMode={isMdUp ? 'scroll' : 'swipe'}
        localProgress={localProgress}
        onMobileStepIndexChange={setMobileStepIndex}
      />
      <IllustrationColumn>
        <IllustrationMount illustration={illustration} />
      </IllustrationColumn>
    </Root>
  );
}
