'use client';

import { Body, Heading, StepperProgressRail } from '@/design-system/components';
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
  transition:
    opacity 0.4s ease,
    transform 0.4s ease;

  @media (min-width: ${theme.breakpoints.md}px) {
    opacity: var(--step-opacity, 1);
    pointer-events: var(--step-pointer-events, auto);
    row-gap: ${theme.spacing(6)};
    transform: var(--step-translate-y, translateY(0));
  }
`;

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
      <StepperProgressRail
        activeStepIndex={activeStepIndex}
        inactiveColor={theme.colors.primary.text[20]}
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
