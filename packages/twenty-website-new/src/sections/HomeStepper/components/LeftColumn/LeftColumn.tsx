'use client';

import { Body, Heading } from '@/design-system/components';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { HomeStepperStepType } from '../../types/HomeStepperStep';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import { useEffect, type CSSProperties } from 'react';

const LeftColumnRoot = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: ${theme.spacing(6)};
  min-width: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    gap: ${theme.spacing(10)};
    height: max-content;
    position: sticky;
    top: calc(50vh - 150px);
  }
`;

const StepsColumn = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  min-width: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    max-width: 454px;
  }
`;

const StepBlock = styled.div`
  align-content: center;
  display: grid;
  grid-template-columns: 1fr;
  min-height: 80vh;
  opacity: 1;
  row-gap: ${theme.spacing(4)};
  transition: opacity 0.4s ease, transform 0.4s ease;

  @media (min-width: ${theme.breakpoints.md}px) {
    min-height: auto;
    opacity: var(--step-opacity, 1);
    pointer-events: var(--step-pointer-events, auto);
    row-gap: ${theme.spacing(6)};
    transform: var(--step-translate-y, translateY(0));
    margin-bottom: ${theme.spacing(20)};
  }

  &[data-active='true'] {
    opacity: 1;
  }
`;

export type HomeStepperLeftColumnProps = {
  activeStepIndex: number;
  onActiveStepChange: (index: number) => void;
  scrollProgress: number;
  steps: HomeStepperStepType[];
};

export function LeftColumn({
  activeStepIndex,
  onActiveStepChange,
  scrollProgress,
  steps,
}: HomeStepperLeftColumnProps) {
  const stepCount = steps.length;

  useEffect(() => {
    const derivedIndex = Math.min(stepCount - 1, Math.max(0, Math.round(scrollProgress * (stepCount - 1))));
    if (derivedIndex !== activeStepIndex) {
      onActiveStepChange(derivedIndex);
    }
  }, [scrollProgress, stepCount, activeStepIndex, onActiveStepChange]);

  return (
    <LeftColumnRoot>
      <ProgressBar
        activeStepIndex={activeStepIndex}
        scrollProgress={scrollProgress}
        steps={steps}
      />
      <StepsColumn>
        {steps.map((step, index) => {
          const isActive = index <= activeStepIndex;

          let opacity = 1;
          let translateY = 0;

          if (index > 0) {
            const globalProgress = scrollProgress * (stepCount - 1);
            const start = index - 1;
            const progress = globalProgress - start;

            if (progress >= 1) {
              opacity = 1;
              translateY = 0;
            } else if (progress > 0) {
              opacity = 0.4 + 0.6 * progress;
              translateY = 40 * (1 - progress);
            } else {
              const p = Math.max(0, progress + 1);
              opacity = 0.4 * p;
              translateY = 40 + 40 * (1 - p);
            }
          }

          return (
            <StepBlock
              data-active={String(isActive)}
              data-step-index={index}
              key={index}
              style={
                {
                  '--step-opacity': opacity,
                  '--step-pointer-events': opacity > 0 ? 'auto' : 'none',
                  '--step-translate-y': `translateY(${translateY}px)`,
                } as CSSProperties
              }
            >
              <Heading segments={step.heading} size="lg" weight="light" />
              <Body body={step.body} size="sm" />
            </StepBlock>
          );
        })}
      </StepsColumn>
    </LeftColumnRoot>
  );
}