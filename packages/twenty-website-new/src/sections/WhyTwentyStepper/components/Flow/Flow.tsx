'use client';

import { SyncScrollProgressFromContainerEffect } from '@/sections/WhyTwentyStepper/effect-components/SyncScrollProgressFromContainerEffect';
import type { WhyTwentyStepperDataType } from '@/sections/WhyTwentyStepper/types';
import { useRef, useState } from 'react';
import { Content } from '../Content/Content';
import { Root } from '../Root/Root';
import { Visual } from '../Visual/Visual';

type FlowProps = WhyTwentyStepperDataType;

export function Flow({ body, heading, illustration }: FlowProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollContainerRef = useRef<HTMLElement>(null);

  const stepCount = body.length;
  const globalProgress = scrollProgress * (stepCount - 1);
  const activeStepIndex = Math.min(
    stepCount - 1,
    Math.max(0, Math.floor(globalProgress)),
  );

  return (
    <Root scrollContainerRef={scrollContainerRef}>
      <SyncScrollProgressFromContainerEffect
        onScrollProgress={setScrollProgress}
        scrollContainerRef={scrollContainerRef}
      />
      <Content
        activeStepIndex={activeStepIndex}
        body={body}
        heading={heading}
        scrollProgress={scrollProgress}
      />
      <Visual illustration={illustration} />
    </Root>
  );
}
