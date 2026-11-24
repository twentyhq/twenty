'use client';

import { styled } from '@linaria/react';
import { type ReactNode, useRef, useState } from 'react';

import {
  ScrollProgressEffect,
  useBreakpointStepSync,
  useMediaQuery,
} from '@/platform/motion';
import { BREAKPOINT_PX, mediaUp, MENU_HEIGHT_PX, spacing } from '@/tokens';
import { SectionShell } from '@/ui';

import { HomeStepperLottie } from './components/HomeStepperLottie';
import { HomeStepperSteps } from './components/HomeStepperSteps';
import { HomeStepperVisualFrame } from './components/HomeStepperVisualFrame';
import { STEPPER_STEPS, type StepperStep } from './data/stepper.data';

const ScrollStage = styled.div`
  scroll-margin-top: ${MENU_HEIGHT_PX}px;
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

// What a page's own visual is drawn from: the step in view and, while the
// stepper scrolls (md and up), how far the reader is through it.
export type HomeStepperVisualState = {
  activeStepIndex: number;
  localProgress: number | undefined;
};

type HomeStepperProps = {
  anchorId?: string;
  // Another page's visual in the same frame; the home's Lottie by default.
  renderVisual?: (state: HomeStepperVisualState) => ReactNode;
  steps?: readonly StepperStep[];
};

export function HomeStepper({
  anchorId,
  renderVisual,
  steps = STEPPER_STEPS,
}: HomeStepperProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isMdUp = useMediaQuery(`(min-width: ${BREAKPOINT_PX.md}px)`);
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
    <SectionShell scheme="muted">
      <ScrollProgressEffect
        enabled={isMdUp}
        onScrollProgress={setScrollProgress}
        scrollContainerRef={scrollContainerRef}
      />
      <ScrollStage id={anchorId} ref={scrollContainerRef}>
        <HomeStepperSteps
          activeStepIndex={activeStepIndex}
          layoutMode={isMdUp ? 'scroll' : 'swipe'}
          localProgress={localProgress}
          onMobileStepIndexChange={setMobileStepIndex}
          steps={steps}
        />
        <VisualColumn>
          <VisualMeasure>
            <HomeStepperVisualFrame>
              {renderVisual === undefined ? (
                <HomeStepperLottie scrollProgress={visualScrollProgress} />
              ) : (
                renderVisual({
                  activeStepIndex: isMdUp ? activeStepIndex : mobileStepIndex,
                  localProgress: isMdUp ? localProgress : undefined,
                })
              )}
            </HomeStepperVisualFrame>
          </VisualMeasure>
        </VisualColumn>
      </ScrollStage>
    </SectionShell>
  );
}
