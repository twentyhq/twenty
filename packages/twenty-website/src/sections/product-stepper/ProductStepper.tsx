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

import { ProductStepperContent } from './components/ProductStepperContent';
import { PRODUCT_STEPPER_STEPS } from './data/product-stepper-data';
import { ProductStepperVisual } from './components/ProductStepperVisual';

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
