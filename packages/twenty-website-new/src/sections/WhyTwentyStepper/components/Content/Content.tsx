'use client';

import { Body, Heading } from '@/design-system/components';
import type { BodyType } from '@/design-system/components/Body/types/Body';
import type { HeadingType } from '@/design-system/components/Heading/types/Heading';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { CSSProperties } from 'react';

const ContentRoot = styled.div`
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

const ProgressRail = styled.div`
  display: none;

  @media (min-width: ${theme.breakpoints.md}px) {
    align-items: center;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing(2)};
    height: max-content;
    position: sticky;
    top: calc(50vh - ${theme.spacing(10)});
  }
`;

const StepIndicatorRow = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${theme.spacing(4)};
`;

const PillBackground = styled.div`
  background-color: ${theme.colors.primary.text[20]};
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
  line-height: ${theme.spacing(4)};
  margin: 0;
  text-transform: uppercase;
`;

const InactiveDotWrapper = styled.div`
  align-items: center;
  display: flex;
  gap: ${theme.spacing(4)};
`;

const InactiveDot = styled.div`
  background-color: ${theme.colors.primary.text[20]};
  border-radius: 50%;
  height: ${theme.spacing(1)};
  width: ${theme.spacing(1)};
`;

const StepsColumn = styled.div`
  display: grid;
  gap: ${theme.spacing(8)};
  grid-template-columns: 1fr;
  min-width: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    max-width: 556px;
  }
`;

const HeadingBlock = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  row-gap: ${theme.spacing(4)};
`;

const StepBlock = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  opacity: 1;
  row-gap: ${theme.spacing(4)};
  transition: opacity 0.4s ease, transform 0.4s ease;

  @media (min-width: ${theme.breakpoints.md}px) {
    opacity: var(--step-opacity, 1);
    pointer-events: var(--step-pointer-events, auto);
    row-gap: ${theme.spacing(6)};
    transform: var(--step-translate-y, translateY(0));
  }
`;

type ProgressRailProps = {
  activeStepIndex: number;
  scrollProgress: number;
  stepCount: number;
};

function WhyTwentyProgressRail({
  activeStepIndex,
  scrollProgress,
  stepCount,
}: ProgressRailProps) {
  const globalProgress = scrollProgress * (stepCount - 1);

  const fillPercentage =
    globalProgress >= stepCount - 1
      ? 100
      : (globalProgress - activeStepIndex) * 100;

  const nodes = [];

  for (let index = 0; index < stepCount; index += 1) {
    if (index === activeStepIndex) {
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

export type WhyTwentyStepperContentProps = {
  activeStepIndex: number;
  body: BodyType[];
  heading: HeadingType;
  scrollProgress: number;
};

export function Content({
  activeStepIndex,
  body,
  heading,
  scrollProgress,
}: WhyTwentyStepperContentProps) {
  const stepCount = body.length;

  return (
    <ContentRoot>
      <WhyTwentyProgressRail
        activeStepIndex={activeStepIndex}
        scrollProgress={scrollProgress}
        stepCount={stepCount}
      />
      <StepsColumn>
        <HeadingBlock>
          <Heading as="h2" segments={heading} size="xl" weight="light" />
        </HeadingBlock>
        {body.map((bodyItem, index) => {
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
              key={index}
              style={
                {
                  '--step-opacity': opacity,
                  '--step-pointer-events': opacity > 0 ? 'auto' : 'none',
                  '--step-translate-y': `translateY(${translateY}px)`,
                } as CSSProperties
              }
            >
              <Body body={bodyItem} family="sans" size="md" weight="regular" />
            </StepBlock>
          );
        })}
      </StepsColumn>
    </ContentRoot>
  );
}
