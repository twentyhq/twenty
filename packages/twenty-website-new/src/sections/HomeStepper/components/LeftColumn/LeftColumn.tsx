'use client';

import { Body, Heading } from '@/design-system/components';
import { HOME_STEPPER_LEFT_HOLD_LOCAL_PROGRESS_MAX } from '@/sections/HomeStepper/utils/home-stepper-lottie-frame-map';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { CSSProperties } from 'react';
import type { HomeStepperStepType } from '../../types/HomeStepperStep';
import { ProgressBar } from '../ProgressBar/ProgressBar';

const LeftColumnRoot = styled.div`
  min-width: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    margin-left: calc(-1 * ${theme.spacing(4)});
  }
`;

const StickyPanel = styled.div`
  display: grid;
  gap: ${theme.spacing(6)};
  grid-template-columns: auto 1fr;

  @media (min-width: ${theme.breakpoints.md}px) {
    gap: ${theme.spacing(20)};
    height: 100vh;
    margin-bottom: -100vh;
    position: sticky;
    top: 0;
    z-index: 1;
  }
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

const StepBlock = styled.div`
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
      opacity: var(--step-opacity, 0);
    }
  }
`;

const StepSpacer = styled.div`
  display: none;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: block;
    min-height: 100vh;
  }
`;

export type HomeStepperLeftColumnProps = {
  activeStepIndex: number;
  localProgress: number;
  steps: HomeStepperStepType[];
};

function clampUnit(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function computeDesktopStepOpacity(
  index: number,
  activeStepIndex: number,
  localProgress: number,
  stepCount: number,
): number {
  const holdMax = HOME_STEPPER_LEFT_HOLD_LOCAL_PROGRESS_MAX;

  if (index === activeStepIndex) {
    if (index === stepCount - 1 || localProgress <= holdMax) {
      return 1;
    }
    return 1 - clampUnit((localProgress - holdMax) / (1 - holdMax));
  }

  if (index === activeStepIndex + 1 && localProgress > holdMax) {
    return clampUnit((localProgress - holdMax) / (1 - holdMax));
  }

  return 0;
}

export function LeftColumn({
  activeStepIndex,
  localProgress,
  steps,
}: HomeStepperLeftColumnProps) {
  return (
    <LeftColumnRoot>
      <StickyPanel>
        <ProgressBar
          activeStepIndex={activeStepIndex}
          localProgress={localProgress}
          steps={steps}
        />
        <StepsContainer>
          {steps.map((step, index) => {
            const desktopOpacity = computeDesktopStepOpacity(
              index,
              activeStepIndex,
              localProgress,
              steps.length,
            );

            return (
              <StepBlock
                data-active={String(index === activeStepIndex)}
                key={index}
                style={
                  { '--step-opacity': desktopOpacity } as CSSProperties
                }
              >
                <Heading segments={step.heading} size="lg" weight="light" />
                <Body body={step.body} size="sm" />
              </StepBlock>
            );
          })}
        </StepsContainer>
      </StickyPanel>
      {steps.map((_, index) => (
        <StepSpacer key={`spacer-${index}`} />
      ))}
    </LeftColumnRoot>
  );
}
