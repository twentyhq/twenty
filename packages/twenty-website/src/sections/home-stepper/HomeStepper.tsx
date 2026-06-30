'use client';

import { styled } from '@linaria/react';
import { useRef, useState } from 'react';

import {
  ScrollProgressEffect,
  useBreakpointStepSync,
  useMediaQuery,
} from '@/platform/motion';
import { BREAKPOINT_PX, mediaUp, spacing } from '@/tokens';
import { SectionShell } from '@/ui';

import { HomeStepperLottie } from './components/HomeStepperLottie';
import { HomeStepperSteps } from './components/HomeStepperSteps';
import { HomeStepperVisualFrame } from './components/HomeStepperVisualFrame';
import { STEPPER_STEPS } from './data/stepper.data';

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

export function HomeStepper() {
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
        <HomeStepperSteps
          activeStepIndex={activeStepIndex}
          layoutMode={isMdUp ? 'scroll' : 'swipe'}
          localProgress={localProgress}
          onMobileStepIndexChange={setMobileStepIndex}
          steps={STEPPER_STEPS}
        />
        <VisualColumn>
          <VisualMeasure>
            <HomeStepperVisualFrame>
              <HomeStepperLottie scrollProgress={visualScrollProgress} />
            </HomeStepperVisualFrame>
          </VisualMeasure>
        </VisualColumn>
      </ScrollStage>
    </SectionShell>
  );
}
