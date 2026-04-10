'use client';

import { IllustrationMount } from '@/illustrations';
import { SyncScrollProgressFromContainerEffect } from '@/sections/WhyTwentyStepper/effect-components/SyncScrollProgressFromContainerEffect';
import type { WhyTwentyStepperDataType } from '@/sections/WhyTwentyStepper/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { useRef, useState } from 'react';
import { Content } from '../Content/Content';
import { Root } from '../Root/Root';

const IllustrationColumn = styled.div`
  min-width: 0;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    align-self: start;
    max-width: 672px;
    position: sticky;
    top: calc(4.5rem + (100vh - 4.5rem) * 0.5 - 368px);
  }
`;

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
      <IllustrationColumn>
        <IllustrationMount illustration={illustration} />
      </IllustrationColumn>
    </Root>
  );
}
