'use client';

import {
  Body,
  Eyebrow,
  Heading,
  StepperProgressRail,
} from '@/design-system/components';
import { INFORMATIVE_ICONS } from '@/icons';
import { useRenderMessage } from '@/lib/i18n/use-render-message';
import { StepperSwipeDeck } from '@/lib/stepper';
import type { ProductStepperContentProps } from '@/sections/ProductStepper/types';
import type { ProductStepperContentStepType } from '@/sections/ProductStepper/types/ProductStepperContentStep';
import { theme } from '@/theme';
import type { MessageDescriptor } from '@lingui/core';
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

const StepBlock = styled.div<{ $opacity: number; $translateY: number }>`
  display: grid;
  grid-template-columns: 1fr;
  opacity: 1;
  row-gap: ${theme.spacing(2)};
  transition:
    opacity 0.4s ease,
    transform 0.4s ease;

  @media (min-width: ${theme.breakpoints.md}px) {
    opacity: ${({ $opacity }) => $opacity};
    transform: translateY(${({ $translateY }) => `${$translateY}px`});
  }
`;

const SwipeStepBlock = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  row-gap: ${theme.spacing(2)};
`;

const IntroBlock = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  margin-bottom: ${theme.spacing(4)};
  margin-top: 0;
  row-gap: ${theme.spacing(2)};

  @media (min-width: ${theme.breakpoints.md}px) {
    margin-top: calc(${theme.spacing(2)} - ${theme.spacing(26)});
  }
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

function renderProductStepBlock(
  step: ProductStepperContentStepType,
  index: number,
  activeStepIndex: number,
  localProgress: number,
  renderText: (descriptor: MessageDescriptor) => string,
  variant: 'scroll' | 'swipe',
) {
  const Icon = INFORMATIVE_ICONS[step.icon];
  const isActive =
    variant === 'swipe' ? index === activeStepIndex : index <= activeStepIndex;
  const iconColor = isActive
    ? theme.colors.highlight[100]
    : theme.colors.secondary.text[100];

  let opacity = 1;
  let translateY = 0;

  if (variant === 'scroll') {
    if (index > activeStepIndex + 1) {
      opacity = 0;
      translateY = 300;
    } else if (index === activeStepIndex + 1) {
      opacity = 0.4;
      translateY = 300 * (1 - localProgress);
    }
  }

  const inner = (
    <>
      <StepRowHeader>
        <StepIconBox data-active={String(isActive)}>
          {Icon ? (
            <Icon
              color={
                isActive ? theme.colors.primary.background[100] : iconColor
              }
              size={14}
            />
          ) : null}
        </StepIconBox>
        <Heading
          renderText={renderText}
          segments={step.heading}
          size="sm"
          weight="regular"
        />
      </StepRowHeader>
      <Body body={step.body} renderText={renderText} size="sm" />
    </>
  );

  if (variant === 'swipe') {
    return (
      <SwipeStepBlock data-active={String(isActive)} key={index}>
        {inner}
      </SwipeStepBlock>
    );
  }

  return (
    <StepBlock
      $opacity={opacity}
      $translateY={translateY}
      data-active={String(isActive)}
      key={index}
    >
      {inner}
    </StepBlock>
  );
}

export function Content({
  activeStepIndex,
  body,
  eyebrow,
  heading,
  layoutMode,
  localProgress,
  onMobileStepIndexChange,
  steps,
}: ProductStepperContentProps) {
  const renderText = useRenderMessage();

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
          <Eyebrow
            colorScheme="primary"
            heading={eyebrow.heading}
            renderText={renderText}
          />
          <Heading size="lg" weight="light">
            {heading}
          </Heading>
          <Body body={body} renderText={renderText} size="sm" />
        </IntroBlock>
        {layoutMode === 'swipe' ? (
          <StepperSwipeDeck
            activeIndex={activeStepIndex}
            onActiveIndexChange={onMobileStepIndexChange}
            stepCount={steps.length}
          >
            {(stepIndex) =>
              renderProductStepBlock(
                steps[stepIndex],
                stepIndex,
                activeStepIndex,
                localProgress,
                renderText,
                'swipe',
              )
            }
          </StepperSwipeDeck>
        ) : (
          steps.map((step, index) =>
            renderProductStepBlock(
              step,
              index,
              activeStepIndex,
              localProgress,
              renderText,
              'scroll',
            ),
          )
        )}
      </StepsColumn>
    </ContentRoot>
  );
}
