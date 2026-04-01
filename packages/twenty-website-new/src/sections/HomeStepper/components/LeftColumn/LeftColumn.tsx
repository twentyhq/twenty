'use client';

import { Body, Heading } from '@/design-system/components';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { useRef } from 'react';
import { ObserveActiveStepFromIntersectionEffect } from '../../effect-components/ObserveActiveStepFromIntersectionEffect';
import type { HomeStepperStepType } from '../../types/HomeStepperStep';
import { ProgressBar } from '../ProgressBar/ProgressBar';

const LeftColumnRoot = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: ${theme.spacing(6)};
  min-width: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    gap: ${theme.spacing(10)};
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
  opacity: 0.3;
  row-gap: ${theme.spacing(4)};
  transition: opacity 0.4s ease;

  @media (min-width: ${theme.breakpoints.md}px) {
    min-height: 100vh;
    row-gap: ${theme.spacing(6)};
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
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  return (
    <LeftColumnRoot>
      <ObserveActiveStepFromIntersectionEffect
        onActiveStepChange={onActiveStepChange}
        stepRefs={stepRefs}
        stepsLength={steps.length}
      />
      <ProgressBar
        activeStepIndex={activeStepIndex}
        scrollProgress={scrollProgress}
        steps={steps}
      />
      <StepsColumn>
        {steps.map((step, index) => (
          <StepBlock
            data-active={String(index === activeStepIndex)}
            data-step-index={index}
            key={index}
            ref={(element) => {
              stepRefs.current[index] = element;
            }}
          >
            <Heading segments={step.heading} size="lg" weight="light" />
            <Body body={step.body} size="sm" />
          </StepBlock>
        ))}
      </StepsColumn>
    </LeftColumnRoot>
  );
}
