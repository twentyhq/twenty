'use client';

import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { type CSSProperties } from 'react';

import { mediaUp, spacing } from '@/tokens';
import { Body, Heading } from '@/ui';

import { StepperProgressRail } from './stepper-progress-rail';
import { StepperSwipeDeck } from './stepper-swipe-deck';
import { type StepperStep } from './stepper.data';

// Each step holds fully visible for most of its scroll chapter, then hands
// off to the next over the remaining fraction (values ported from the
// authored lottie chapter boundaries).
const HOLD_FRACTIONS = [240 / 285, (880 - 285) / (925 - 285), 1];

const StepsRoot = styled.div`
  min-width: 0;

  ${mediaUp('md')} {
    display: grid;
  }
`;

const StickyPanel = styled.div`
  display: grid;
  gap: ${spacing(6)};
  grid-template-columns: auto 1fr;

  ${mediaUp('md')} {
    align-items: center;
    align-self: start;
    gap: ${spacing(20)};
    grid-area: 1 / 1;
    height: 100vh;
    overflow: hidden;
    position: sticky;
    top: 0;
  }
`;

const SpacerStack = styled.div`
  display: none;

  ${mediaUp('md')} {
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

  ${mediaUp('md')} {
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
  min-width: 0;
  row-gap: ${spacing(4)};

  ${mediaUp('md')} {
    opacity: var(--step-opacity, 0);
    row-gap: ${spacing(6)};
    transform: var(--step-transform, none);
  }
`;

const SwipeStepBlock = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  max-width: 454px;
  min-width: 0;
  row-gap: ${spacing(4)};
`;

const computeStepStyle = (
  index: number,
  activeStepIndex: number,
  localProgress: number,
  stepCount: number,
): { opacity: number; transform: string } => {
  const holdMax = HOLD_FRACTIONS[activeStepIndex] ?? 1;
  if (index === activeStepIndex) {
    if (index === stepCount - 1 || localProgress <= holdMax) {
      return { opacity: 1, transform: 'translateY(0)' };
    }
    const t = Math.min(1, (localProgress - holdMax) / (1 - holdMax));
    return { opacity: 1 - t, transform: `translateY(${-40 * t}vh)` };
  }
  if (index === activeStepIndex + 1 && localProgress > holdMax) {
    const t = Math.min(1, (localProgress - holdMax) / (1 - holdMax));
    return { opacity: t, transform: `translateY(${40 * (1 - t)}vh)` };
  }
  return { opacity: 0, transform: 'translateY(40vh)' };
};

export type StepperStepsProps = {
  activeStepIndex: number;
  layoutMode: 'scroll' | 'swipe';
  localProgress: number;
  onMobileStepIndexChange: (nextIndex: number) => void;
  steps: readonly StepperStep[];
};

export function StepperSteps({
  activeStepIndex,
  layoutMode,
  localProgress,
  onMobileStepIndexChange,
  steps,
}: StepperStepsProps) {
  const { i18n } = useLingui();

  const renderStepContent = (step: StepperStep) => (
    <>
      <Heading as="h3" size="lg" weight="light">
        {i18n._(step.heading)}
      </Heading>
      <Body muted size="sm">
        {i18n._(step.body)}
      </Body>
    </>
  );

  return (
    <StepsRoot>
      <StickyPanel>
        <StepperProgressRail
          activeStepIndex={activeStepIndex}
          localProgress={localProgress}
          stepCount={steps.length}
        />
        <StepsContainer>
          {layoutMode === 'swipe' ? (
            <StepperSwipeDeck
              activeIndex={activeStepIndex}
              onActiveIndexChange={onMobileStepIndexChange}
              stepCount={steps.length}
            >
              {(stepIndex) => (
                <SwipeStepBlock>
                  {renderStepContent(steps[stepIndex])}
                </SwipeStepBlock>
              )}
            </StepperSwipeDeck>
          ) : (
            steps.map((step, index) => {
              const { opacity, transform } = computeStepStyle(
                index,
                activeStepIndex,
                localProgress,
                steps.length,
              );
              return (
                <StepBlock
                  key={step.heading.id}
                  style={
                    {
                      '--step-opacity': opacity,
                      '--step-transform': transform,
                    } as CSSProperties
                  }
                >
                  {renderStepContent(step)}
                </StepBlock>
              );
            })
          )}
        </StepsContainer>
      </StickyPanel>
      <SpacerStack>
        {steps.map((step) => (
          <StepSpacer key={step.heading.id} />
        ))}
      </SpacerStack>
    </StepsRoot>
  );
}
