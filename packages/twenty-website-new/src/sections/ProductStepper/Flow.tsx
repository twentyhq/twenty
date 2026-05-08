'use client';

import { Container } from '@/design-system/components';
import type { ImageType } from '@/design-system/components/Image';
import type { MessageDescriptor } from '@lingui/core';
import { ScrollProgressEffect } from '@/lib/scroll';
import { useStepperMdUp } from '@/sections/Stepper';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Content } from './Content';
import { Visual } from './Visual';

export type ProductStepperStepType = {
  body: MessageDescriptor;
  heading: ReactNode;
  icon: string;
  image: ImageType;
};

const StyledSection = styled.section`
  background-color: ${theme.colors.primary.text[5]};
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    height: 300vh;
  }
`;

const Grid = styled(Container)`
  display: grid;
  grid-template-columns: 1fr;
  min-width: 0;
  padding-bottom: ${theme.spacing(12)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(12)};
  row-gap: ${theme.spacing(10)};
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    align-items: start;
    column-gap: ${theme.spacing(10)};
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    min-height: 100%;
    padding-bottom: ${theme.spacing(20)};
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
    padding-top: ${theme.spacing(20)};
    row-gap: ${theme.spacing(12)};
  }
`;

type FlowProps = {
  body: ReactNode;
  children: ReactNode;
  eyebrow: ReactNode;
  steps: ProductStepperStepType[];
};

export function Flow({ body, children, eyebrow, steps }: FlowProps) {
  const isMdUp = useStepperMdUp();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileStepIndex, setMobileStepIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLElement>(null);
  const previousMdUpRef = useRef(isMdUp);

  useEffect(() => {
    if (previousMdUpRef.current && !isMdUp) {
      const scrollDerivedIndex = Math.min(
        steps.length - 1,
        Math.floor(scrollProgress * steps.length),
      );
      setMobileStepIndex(scrollDerivedIndex);
    }
    previousMdUpRef.current = isMdUp;
  }, [isMdUp, scrollProgress, steps.length]);

  const activeStepIndex = isMdUp
    ? Math.min(steps.length - 1, Math.floor(scrollProgress * steps.length))
    : mobileStepIndex;

  const localProgress = isMdUp
    ? scrollProgress * steps.length - activeStepIndex
    : 0;

  const contentSteps = steps.map(
    ({ body: stepBody, heading: stepHeading, icon }) => ({
      body: stepBody,
      heading: stepHeading,
      icon,
    }),
  );

  const images = steps.map((step) => step.image);

  return (
    <StyledSection ref={scrollContainerRef}>
      <Grid>
        <ScrollProgressEffect
          onScrollProgress={setScrollProgress}
          scrollContainerRef={scrollContainerRef}
          enabled={isMdUp}
        />
        <Content
          activeStepIndex={activeStepIndex}
          body={body}
          heading={children}
          eyebrow={eyebrow}
          layoutMode={isMdUp ? 'scroll' : 'swipe'}
          localProgress={localProgress}
          onMobileStepIndexChange={setMobileStepIndex}
          steps={contentSteps}
        />
        <Visual activeStepIndex={activeStepIndex} images={images} />
      </Grid>
    </StyledSection>
  );
}
