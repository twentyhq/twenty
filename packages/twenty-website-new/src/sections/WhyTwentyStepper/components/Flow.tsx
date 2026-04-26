'use client';

import { ScrollProgressEffect } from '@/lib/scroll';
import { useStepperMdUp } from '@/lib/stepper';
import { WebGlMount } from '@/lib/visual-runtime';
import { Logo as WhyTwentyStepperLogo } from '@/sections/WhyTwentyStepper/visuals/Logo';
import type { WhyTwentyStepperDataType } from '@/sections/WhyTwentyStepper/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { useEffect, useRef, useState } from 'react';
import { Content } from './Content';
import { Root } from './Root';

const IllustrationColumn = styled.div`
  min-width: 0;
  width: 100%;

  @media (max-width: ${theme.breakpoints.md - 1}px) {
    order: -1;
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    align-items: center;
    align-self: start;
    display: flex;
    height: calc(100vh - 4.5rem);
    justify-content: center;
    position: sticky;
    top: 4.5rem;
  }
`;

const IllustrationFrame = styled.div`
  min-width: 0;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    max-width: 672px;
  }
`;

type FlowProps = WhyTwentyStepperDataType;

export function Flow({ body, heading }: FlowProps) {
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
      <ScrollProgressEffect
        onScrollProgress={setScrollProgress}
        scrollContainerRef={scrollContainerRef}
        enabled={isMdUp}
      />
      <Content
        activeStepIndex={activeStepIndex}
        body={body}
        heading={heading}
        layoutMode={isMdUp ? 'scroll' : 'swipe'}
        localProgress={localProgress}
        onMobileStepIndexChange={setMobileStepIndex}
      />
      <IllustrationColumn>
        <IllustrationFrame>
          <WebGlMount>
            <WhyTwentyStepperLogo />
          </WebGlMount>
        </IllustrationFrame>
      </IllustrationColumn>
    </Root>
  );
}
