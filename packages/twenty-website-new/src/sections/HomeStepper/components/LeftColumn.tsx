'use client';

import { Body } from '@/design-system/components';
import { StepperSwipeDeck } from '@/sections/Stepper';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react';
import type { HomeStepperStepType } from './../types/home-stepper-step';
import { ProgressBar } from './ProgressBar';

const HOME_STEPPER_HOLD_FRACTIONS = [
  240 / 285,
  (880 - 285) / (925 - 285),
  1,
] as const;

const LeftColumnRoot = styled.div`
  min-width: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: grid;
    margin-left: calc(-1 * ${theme.spacing(4)});
  }
`;

const StickyPanel = styled.div`
  display: grid;
  gap: ${theme.spacing(6)};
  grid-template-columns: auto 1fr;

  @media (min-width: ${theme.breakpoints.md}px) {
    align-items: center;
    align-self: start;
    gap: ${theme.spacing(20)};
    grid-area: 1 / 1;
    height: 100vh;
    overflow: hidden;
    position: sticky;
    top: 0;
  }
`;

const SpacerStack = styled.div`
  display: none;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: block;
    grid-area: 1 / 1;
  }
`;

const StepSpacer = styled.div`
  min-height: 100vh;
`;

const StepsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  min-width: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    & > * {
      grid-area: 1 / 1;
    }
  }
`;

const StepBlock = styled.div<{ $opacity: number; $transform: string }>`
  align-content: center;
  display: grid;
  grid-template-columns: 1fr;
  max-width: 454px;
  min-height: 80vh;
  min-width: 0;
  opacity: 0.3;
  row-gap: ${theme.spacing(4)};
  transition: opacity 0.3s ease;

  &[data-active='true'] {
    opacity: 1;
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    min-height: 0;
    row-gap: ${theme.spacing(6)};
    transition: none;

    &,
    &[data-active='true'] {
      opacity: ${({ $opacity }) => $opacity};
      transform: ${({ $transform }) => $transform};
    }
  }
`;

const SwipeStepBlock = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  max-width: 454px;
  min-width: 0;
  row-gap: ${theme.spacing(4)};
`;

type HomeStepperLayoutMode = 'scroll' | 'swipe';

type HomeStepperLeftColumnProps = {
  activeStepIndex: number;
  layoutMode: HomeStepperLayoutMode;
  localProgress: number;
  onMobileStepIndexChange: (nextIndex: number) => void;
  steps: HomeStepperStepType[];
};

function computeDesktopStepStyle(
  index: number,
  activeStepIndex: number,
  localProgress: number,
  stepCount: number,
): { opacity: number; transform: string } {
  const holdMax = HOME_STEPPER_HOLD_FRACTIONS[activeStepIndex] ?? 1;

  if (index === activeStepIndex) {
    if (index === stepCount - 1 || localProgress <= holdMax) {
      return { opacity: 1, transform: 'translateY(0)' };
    }
    const t = Math.min(1, (localProgress - holdMax) / (1 - holdMax));
    return {
      opacity: 1 - t,
      transform: `translateY(${-40 * t}vh)`,
    };
  }

  if (index === activeStepIndex + 1 && localProgress > holdMax) {
    const t = Math.min(1, (localProgress - holdMax) / (1 - holdMax));
    return {
      opacity: t,
      transform: `translateY(${40 * (1 - t)}vh)`,
    };
  }

  return { opacity: 0, transform: 'translateY(40vh)' };
}

export function LeftColumn({
  activeStepIndex,
  layoutMode,
  localProgress,
  onMobileStepIndexChange,
  steps,
}: HomeStepperLeftColumnProps) {
  const { i18n } = useLingui();

  return (
    <LeftColumnRoot>
      <StickyPanel>
        <ProgressBar
          activeStepIndex={activeStepIndex}
          localProgress={localProgress}
          steps={steps}
        />
        <StepsContainer>
          {layoutMode === 'swipe' ? (
            <StepperSwipeDeck
              activeIndex={activeStepIndex}
              onActiveIndexChange={onMobileStepIndexChange}
              stepCount={steps.length}
            >
              {(stepIndex) => {
                const step = steps[stepIndex];
                return (
                  <SwipeStepBlock>
                    {step.heading}
                    <Body size="sm">{i18n._(step.body)}</Body>
                  </SwipeStepBlock>
                );
              }}
            </StepperSwipeDeck>
          ) : (
            steps.map((step, index) => {
              const { opacity, transform } = computeDesktopStepStyle(
                index,
                activeStepIndex,
                localProgress,
                steps.length,
              );

              return (
                <StepBlock
                  $opacity={opacity}
                  $transform={transform}
                  data-active={String(index === activeStepIndex)}
                  key={index}
                  suppressHydrationWarning
                >
                  {step.heading}
                  <Body size="sm">{i18n._(step.body)}</Body>
                </StepBlock>
              );
            })
          )}
        </StepsContainer>
      </StickyPanel>
      <SpacerStack>
        {steps.map((_, index) => (
          <StepSpacer key={index} />
        ))}
      </SpacerStack>
    </LeftColumnRoot>
  );
}
