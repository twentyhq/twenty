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
    align-self: stretch;
    gap: ${theme.spacing(20)};
    margin-left: calc(-1 * ${theme.spacing(4)});
    position: sticky;
    top: 0;
    height: 100vh;
    align-items: center;
  }
`;

const StepsColumn = styled.div`
  display: grid;
  gap: ${theme.spacing(6)};
  grid-template-columns: 1fr;
  min-width: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    height: max-content;
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
    row-gap: ${theme.spacing(6)};
    transform: translateY(var(--step-translate-y, 0px));
  }
`;

export type WhyTwentyStepperContentProps = {
  activeStepIndex: number;
  body: BodyType[];
  heading: HeadingType;
  localProgress: number;
};

export function Content({
  activeStepIndex,
  body,
  heading,
  localProgress,
}: WhyTwentyStepperContentProps) {
  const stepCount = body.length;

  return (
    <ContentRoot>
      <StepperProgressRail
        activeStepIndex={activeStepIndex}
        inactiveColor={theme.colors.primary.text[20]}
        localProgress={localProgress}
        stepCount={stepCount}
      />
      <StepsColumn>
        <HeadingBlock>
          <Heading as="h2" segments={heading} size="xl" weight="light" />
        </HeadingBlock>
        {body.map((bodyItem, index) => {
          let opacity = 1;
          let translateY = 0;

          if (index > activeStepIndex + 1) {
            opacity = 0;
            translateY = 300;
          } else if (index === activeStepIndex + 1) {
            opacity = 0.4;
            translateY = 300 * (1 - localProgress);
          }

          return (
            <StepBlock
              data-active={String(index <= activeStepIndex)}
              key={index}
              style={
                {
                  '--step-opacity': opacity,
                  '--step-translate-y': `${translateY}px`,
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
