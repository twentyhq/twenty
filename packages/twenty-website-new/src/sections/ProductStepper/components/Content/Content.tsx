'use client';

import { Body, Eyebrow, Heading } from '@/design-system/components';
import { INFORMATIVE_ICONS } from '@/icons';
import type { ProductStepperContentProps } from '@/sections/ProductStepper/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { useEffect, useRef } from 'react';

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
    max-width: 520px;
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

const IntroBlock = styled.div`
  align-content: center;
  display: grid;
  grid-template-columns: 1fr;
  min-height: 80vh;
  row-gap: ${theme.spacing(4)};

  @media (min-width: ${theme.breakpoints.md}px) {
    min-height: 100vh;
  }
`;

type ProgressRailProps = {
  activeStepIndex: number;
  stepCount: number;
};

function ProductProgressRail({
  activeStepIndex,
  stepCount,
}: ProgressRailProps) {
  const nodes = [];

  for (let index = 0; index < stepCount; index += 1) {
    if (index === activeStepIndex) {
      nodes.push(
        <StepIndicatorRow key={`step-${index}`}>
          <PillBackground>
            <PillFill style={{ height: '100%' }} />
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

const StepRowHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing(4)};
`;

const StepIconBox = styled.div`
  align-items: center;
  border-radius: ${theme.radius(1)};
  display: flex;
  height: 22px;
  justify-content: center;
  width: 22px;

  &[data-active='true'] {
    background-color: ${theme.colors.highlight[100]};
  }

  &[data-active='false'] {
    background-color: transparent;
  }
`;

export function Content({
  activeStepIndex,
  body,
  eyebrow,
  heading,
  onStepSelect,
  steps,
}: ProductStepperContentProps) {
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
          onStepSelect(index);
        }
      },
      { root: null, threshold: [0, 0.15, 0.3, 0.5, 0.75, 1] },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [onStepSelect, steps]);

  return (
    <ContentRoot>
      <ProductProgressRail
        activeStepIndex={activeStepIndex}
        stepCount={steps.length}
      />
      <StepsColumn>
        <IntroBlock>
          <Eyebrow colorScheme="primary" heading={eyebrow.heading} />
          <Heading segments={heading} size="lg" weight="light" />
          <Body body={body} size="sm" />
        </IntroBlock>
        {steps.map((step, index) => {
          const Icon = INFORMATIVE_ICONS[step.icon];
          const isActive = index === activeStepIndex;
          const iconColor = isActive
            ? theme.colors.highlight[100]
            : theme.colors.secondary.text[100];

          return (
            <StepBlock
              data-active={String(isActive)}
              data-step-index={index}
              key={index}
              ref={(element) => {
                stepRefs.current[index] = element;
              }}
            >
              <StepRowHeader>
                <StepIconBox data-active={String(isActive)}>
                  {Icon ? (
                    <Icon
                      color={
                        isActive
                          ? theme.colors.primary.background[100]
                          : iconColor
                      }
                      size={14}
                    />
                  ) : null}
                </StepIconBox>
                <Heading segments={step.heading} size="md" weight="regular" />
              </StepRowHeader>
              <Body body={step.body} size="sm" />
            </StepBlock>
          );
        })}
      </StepsColumn>
    </ContentRoot>
  );
}
