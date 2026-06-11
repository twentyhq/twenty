'use client';

import { styled } from '@linaria/react';
import { useRef, useState } from 'react';

import { ScrollProgressEffect, useMediaQuery } from '@/platform/motion';
import { BREAKPOINT_PX, mediaUp, spacing } from '@/tokens';
import { SectionShell } from '@/ui';

import { StepperLottie } from './stepper-lottie';
import { StepperSteps } from './stepper-steps';
import { StepperVisualFrame } from './stepper-visual-frame';
import { STEPPER_STEPS } from './stepper.data';
import { useBreakpointStepSync } from './use-breakpoint-step-sync';

const ScrollStage = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  min-width: 0;
  row-gap: ${spacing(10)};

  ${mediaUp('md')} {
    align-items: start;
    column-gap: ${spacing(10)};
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    row-gap: ${spacing(12)};
  }
`;

const VisualColumn = styled.div`
  min-width: 0;
  width: 100%;

  order: -1;

  ${mediaUp('md')} {
    align-items: center;
    align-self: start;
    display: flex;
    height: calc(100vh - 4.5rem);
    justify-content: center;
    order: 0;
    position: sticky;
    top: 4.5rem;
  }
`;

const VisualMeasure = styled.div`
  /* Stacked frame holds near its authored proportions instead of filling
     tablet widths (868x911 at 900px before the cap). */
  margin-inline: auto;
  max-width: 480px;
  min-width: 0;
  width: 100%;

  ${mediaUp('md')} {
    margin-inline: 0;
    max-width: 672px;
  }
`;

export function Stepper() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isMdUp = useMediaQuery(`(min-width: ${BREAKPOINT_PX.md}px)`);
  const [scrollProgress, setScrollProgress] = useState(0);
  const {
    activeStepIndex,
    localProgress,
    mobileStepIndex,
    setMobileStepIndex,
  } = useBreakpointStepSync(isMdUp, scrollProgress, STEPPER_STEPS.length);

  const visualScrollProgress = isMdUp
    ? scrollProgress
    : (mobileStepIndex + 0.5) / STEPPER_STEPS.length;

  return (
    <SectionShell scheme="muted">
      <ScrollProgressEffect
        enabled={isMdUp}
        onScrollProgress={setScrollProgress}
        scrollContainerRef={scrollContainerRef}
      />
      <ScrollStage ref={scrollContainerRef}>
        <StepperSteps
          activeStepIndex={activeStepIndex}
          layoutMode={isMdUp ? 'scroll' : 'swipe'}
          localProgress={localProgress}
          onMobileStepIndexChange={setMobileStepIndex}
          steps={STEPPER_STEPS}
        />
        <VisualColumn>
          <VisualMeasure>
            <StepperVisualFrame>
              <StepperLottie scrollProgress={visualScrollProgress} />
            </StepperVisualFrame>
          </VisualMeasure>
        </VisualColumn>
      </ScrollStage>
    </SectionShell>
  );
}
