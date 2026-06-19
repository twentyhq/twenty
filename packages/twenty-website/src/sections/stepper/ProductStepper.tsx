'use client';

import { styled } from '@linaria/react';
import { useRef, useState } from 'react';

import { ScrollProgressEffect, useMediaQuery } from '@/platform/motion';
import { BREAKPOINT_PX, mediaUp, spacing } from '@/tokens';
import { SectionShell } from '@/ui';

import { ProductStepperContent } from './ProductStepperContent';
import { PRODUCT_STEPPER_STEPS } from './product-stepper-data';
import { ProductStepperVisual } from './ProductStepperVisual';
import { useBreakpointStepSync } from './use-breakpoint-step-sync';

// The 300vh scroll track the sticky content and visual ride (the old
// site put the height on the section; the rhythm shell owns padding, so
// the track is the inner stage here).
const ScrollTrack = styled.div`
  ${mediaUp('md')} {
    height: 300vh;
  }
`;

const ScrollStage = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  min-width: 0;
  row-gap: ${spacing(10)};

  ${mediaUp('md')} {
    align-items: start;
    column-gap: ${spacing(10)};
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    min-height: 100%;
    row-gap: ${spacing(12)};
  }
`;

export function ProductStepper() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isMdUp = useMediaQuery(`(min-width: ${BREAKPOINT_PX.md}px)`);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { activeStepIndex, localProgress, setMobileStepIndex } =
    useBreakpointStepSync(isMdUp, scrollProgress, PRODUCT_STEPPER_STEPS.length);

  return (
    <SectionShell scheme="muted">
      <ScrollProgressEffect
        enabled={isMdUp}
        onScrollProgress={setScrollProgress}
        scrollContainerRef={scrollContainerRef}
      />
      <ScrollTrack ref={scrollContainerRef}>
        <ScrollStage>
          <ProductStepperContent
            activeStepIndex={activeStepIndex}
            layoutMode={isMdUp ? 'scroll' : 'swipe'}
            localProgress={localProgress}
            onMobileStepIndexChange={setMobileStepIndex}
          />
          <ProductStepperVisual activeStepIndex={activeStepIndex} />
        </ScrollStage>
      </ScrollTrack>
    </SectionShell>
  );
}
