'use client';

import { styled } from '@linaria/react';
import { type MessageDescriptor } from '@lingui/core';
import { useRef, useState } from 'react';

import {
  ScrollProgressEffect,
  useBreakpointStepSync,
  useMediaQuery,
} from '@/platform/motion';
import { BREAKPOINT_PX, mediaUp, spacing } from '@/tokens';
import { SectionShell } from '@/ui';

import { ProductStepperContent } from './components/ProductStepperContent';
import { ProductStepperVisual } from './components/ProductStepperVisual';
import { type ProductStepperStep } from './types/product-stepper-step';

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

type ProductStepperProps = {
  anchorId?: string;
  body: MessageDescriptor;
  eyebrow: MessageDescriptor;
  heading: MessageDescriptor;
  steps: readonly ProductStepperStep[];
};

// Sticky steps on the left, one visual per step on the right. Used by
// /product and the partner programs' "How it works".
export function ProductStepper({
  anchorId,
  body,
  eyebrow,
  heading,
  steps,
}: ProductStepperProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isMdUp = useMediaQuery(`(min-width: ${BREAKPOINT_PX.md}px)`);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { activeStepIndex, localProgress, setMobileStepIndex } =
    useBreakpointStepSync(isMdUp, scrollProgress, steps.length);

  return (
    <SectionShell scheme="muted">
      <ScrollProgressEffect
        enabled={isMdUp}
        onScrollProgress={setScrollProgress}
        scrollContainerRef={scrollContainerRef}
      />
      <ScrollTrack id={anchorId} ref={scrollContainerRef}>
        <ScrollStage>
          <ProductStepperContent
            activeStepIndex={activeStepIndex}
            body={body}
            eyebrow={eyebrow}
            heading={heading}
            steps={steps}
            layoutMode={isMdUp ? 'scroll' : 'swipe'}
            localProgress={localProgress}
            onMobileStepIndexChange={setMobileStepIndex}
          />
          <ProductStepperVisual
            activeStepIndex={activeStepIndex}
            localProgress={isMdUp ? localProgress : undefined}
            steps={steps}
          />
        </ScrollStage>
      </ScrollTrack>
    </SectionShell>
  );
}
