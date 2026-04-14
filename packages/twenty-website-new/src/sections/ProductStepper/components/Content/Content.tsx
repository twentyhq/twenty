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
  grid-template-columns: 1fr;
  min-width: 0;
  gap: ${theme.spacing(8)};

  @media (min-width: ${theme.breakpoints.md}px) {
    height: max-content;
    max-width: 556px;
  }
`;

const StepBlock = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  opacity: 1;
  row-gap: ${theme.spacing(2)};
  transition:
    opacity 0.4s ease,
    transform 0.4s ease;

  @media (min-width: ${theme.breakpoints.md}px) {
    opacity: var(--step-opacity, 1);
    transform: translateY(var(--step-translate-y, 0px));
  }
`;

const IntroBlock = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  row-gap: ${theme.spacing(2)};
  margin-top: calc(${theme.spacing(2)} - ${theme.spacing(26)});
  margin-bottom: ${theme.spacing(4)};
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
              data-active={String(isActive)}
              key={index}
              style={
                {
                  '--step-opacity': opacity,
                  '--step-translate-y': `${translateY}px`,
                } as React.CSSProperties
              }
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
                <Heading segments={step.heading} size="sm" weight="regular" />
              </StepRowHeader>
              <Body body={step.body} size="sm" />
            </StepBlock>
          );
        })}
      </StepsColumn>
    </ContentRoot>
  );
}
