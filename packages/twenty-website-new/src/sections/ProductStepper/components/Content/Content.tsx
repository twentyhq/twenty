'use client';

import {
  Body,
  Eyebrow,
  Heading,
  StepperProgressRail,
} from '@/design-system/components';
import { INFORMATIVE_ICONS } from '@/icons';
import type { ProductStepperContentProps } from '@/sections/ProductStepper/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

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
  grid-template-columns: 1fr;
  min-width: 0;
  gap: ${theme.spacing(8)};

  @media (min-width: ${theme.breakpoints.md}px) {
    max-width: 520px;
  }
`;

const StepBlock = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  opacity: 1;
  row-gap: ${theme.spacing(4)};
  transition: opacity 0.4s ease;

  @media (min-width: ${theme.breakpoints.md}px) {
    row-gap: ${theme.spacing(6)};
    opacity: var(--step-opacity, 1);
  }
`;

const IntroBlock = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  row-gap: ${theme.spacing(4)};
`;

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
  localProgress,
  steps,
}: ProductStepperContentProps) {
  return (
    <ContentRoot>
      <StepperProgressRail
        activeStepIndex={activeStepIndex}
        inactiveColor={theme.colors.primary.border[80]}
        localProgress={localProgress}
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
          const isActive = index <= activeStepIndex;
          const iconColor = isActive
            ? theme.colors.highlight[100]
            : theme.colors.secondary.text[100];

          let opacity = 1;

          if (index > activeStepIndex + 1) {
            opacity = 0;
          } else if (index === activeStepIndex + 1) {
            opacity = 0.4;
          }

          return (
            <StepBlock
              data-active={String(isActive)}
              key={index}
              style={{ '--step-opacity': opacity } as React.CSSProperties}
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
