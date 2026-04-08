'use client';

import { IllustrationMount } from '@/illustrations';
import { SyncScrollProgressFromContainerEffect } from '@/sections/WhyTwentyStepper/effect-components/SyncScrollProgressFromContainerEffect';
import type { WhyTwentyStepperDataType } from '@/sections/WhyTwentyStepper/types';
import { useRef, useState } from 'react';
import { Content } from '../Content/Content';
import { Root } from '../Root/Root';

type FlowProps = WhyTwentyStepperDataType;

export function Flow({ body, heading, illustration }: FlowProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollContainerRef = useRef<HTMLElement>(null);

  const stepCount = body.length;
  const activeStepIndex = Math.min(
    stepCount - 1,
    Math.floor(scrollProgress * stepCount),
  );
  const localProgress = scrollProgress * stepCount - activeStepIndex;

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
        localProgress={localProgress}
      />
      <IllustrationMount illustration={illustration} />
    </Root>
  );
}
