'use client';

import { Body, Heading } from '@/design-system/components';
import type { HeroStepperContentProps } from '@/sections/HeroStepper/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { useEffect, useRef, type ReactNode } from 'react';

const ContentRoot = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: ${theme.spacing(6)};
  min-width: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    gap: ${theme.spacing(10)};
  }
`;

const ProgressRail = styled.div`
  display: none;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${theme.spacing(2)};
    position: sticky;
    top: calc(50vh - ${theme.spacing(10)});
    height: max-content;
  }
`;

const StepIndicatorRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing(4)};
`;

const PillBackground = styled.div`
  background-color: ${theme.colors.primary.border[80]};
  border-radius: ${theme.radius(8)};
  display: flex;
  height: ${theme.spacing(20)};
  overflow: hidden;
  width: ${theme.spacing(1)};
`;

const PillFill = styled.div`
  background-color: ${theme.colors.highlight[100]};
  border-radius: ${theme.radius(10)};
  transition: height 0.4s ease;
  width: 100%;
`;

const ActiveLabel = styled.p`
  color: ${theme.colors.highlight[100]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  margin: 0;
  text-transform: uppercase;
  line-height: ${theme.spacing(4)};
`;

const InactiveDotWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing(4)};
`;

const InactiveDot = styled.div`
  background-color: ${theme.colors.primary.border[80]};
  border-radius: 50%;
  height: ${theme.spacing(1)};
  width: ${theme.spacing(1)};
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

type ProgressRailProps = {
  activeImageIndex: number;
  activeStepIndex: number;
  steps: HeroStepperContentProps['steps'];
};

function HeroProgressRail({
  activeImageIndex,
  activeStepIndex,
  steps,
}: ProgressRailProps) {
  const nodes: ReactNode[] = [];
  const stepCount = steps.length;

  for (let index = 0; index < stepCount; index += 1) {
    if (index === activeStepIndex) {
      const stepImagesCount = steps[index]?.images.length || 1;
      const fillPercentage = ((activeImageIndex + 1) / stepImagesCount) * 100;

      nodes.push(
        <StepIndicatorRow key={`step-${index}`}>
          <PillBackground>
            <PillFill style={{ height: `${fillPercentage}%` }} />
          </PillBackground>
          <ActiveLabel>{String(index + 1).padStart(2, '0')}</ActiveLabel>
        </StepIndicatorRow>,
      );
    } else {
      nodes.push(
        <InactiveDotWrapper key={`step-${index}`}>
          <InactiveDot />
        </InactiveDotWrapper>,
      );
    }
  }

  return <ProgressRail>{nodes}</ProgressRail>;
}

export function Content({
  activeImageIndex,
  activeStepIndex,
  onActiveStepChange,
  steps,
}: HeroStepperContentProps) {
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    stepRefs.current = stepRefs.current.slice(0, steps.length);
  }, [steps.length]);

  useEffect(() => {
    const elements = stepRefs.current.filter(Boolean) as HTMLDivElement[];
    if (elements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const candidates = entries.filter(
          (entry) => entry.isIntersecting && entry.intersectionRatio > 0.15,
        );
        if (candidates.length === 0) {
          return;
        }

        const best = candidates.reduce((previous, current) =>
          current.intersectionRatio > previous.intersectionRatio
            ? current
            : previous,
        );
        const indexAttribute = best.target.getAttribute('data-step-index');
        const index = indexAttribute === null ? NaN : Number(indexAttribute);
        if (!Number.isNaN(index)) {
          onActiveStepChange(index);
        }
      },
      { root: null, threshold: [0, 0.15, 0.3, 0.5, 0.75, 1] },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [onActiveStepChange, steps]);

  return (
    <ContentRoot>
      <HeroProgressRail
        activeImageIndex={activeImageIndex}
        activeStepIndex={activeStepIndex}
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
    </ContentRoot>
  );
}
