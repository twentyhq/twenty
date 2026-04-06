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
    gap: ${theme.spacing(20)};
    height: max-content;
    margin-left: calc(-1 * ${theme.spacing(4)});
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
  transition: opacity 0.4s ease;

  @media (min-width: ${theme.breakpoints.md}px) {
    opacity: var(--step-opacity, 1);
    row-gap: ${theme.spacing(6)};
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

          if (index > activeStepIndex + 1) {
            opacity = 0;
          } else if (index === activeStepIndex + 1) {
            opacity = 0.4;
          }

          return (
            <StepBlock
              data-active={String(index <= activeStepIndex)}
              key={index}
              style={{ '--step-opacity': opacity } as CSSProperties}
            >
              <Body body={bodyItem} family="sans" size="md" weight="regular" />
            </StepBlock>
          );
        })}
      </StepsColumn>
    </ContentRoot>
  );
}
