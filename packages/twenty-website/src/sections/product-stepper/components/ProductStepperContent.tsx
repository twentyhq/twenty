'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { type CSSProperties } from 'react';

import { INFORMATIVE_MARKS } from '@/icons';
import { color, fontFamily, mediaUp, radius, spacing } from '@/tokens';
import {
  Body,
  Eyebrow,
  Heading,
  HeadingPair,
  StepperProgressRail,
  StepperSwipeDeck,
} from '@/ui';

import {
  PRODUCT_STEPPER_STEPS,
  type ProductStepperStep,
} from '../data/product-stepper-data';

const ContentRoot = styled.div`
  display: grid;
  gap: ${spacing(6)};
  grid-template-columns: auto 1fr;
  min-width: 0;

  ${mediaUp('md')} {
    align-items: center;
    align-self: stretch;
    gap: ${spacing(20)};
    height: 100vh;
    margin-left: calc(-1 * ${spacing(4)});
    position: sticky;
    top: 0;
  }
`;

const StepsColumn = styled.div`
  display: grid;
  gap: ${spacing(8)};
  grid-template-columns: 1fr;
  min-width: 0;

  ${mediaUp('md')} {
    height: max-content;
    max-width: 556px;
  }
`;

const IntroBlock = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  margin-bottom: ${spacing(4)};
  margin-top: 0;

  & > * + * {
    margin-top: ${spacing(6)};
  }

  ${mediaUp('md')} {
    margin-top: calc(${spacing(2)} - ${spacing(26)});
  }
`;

const StepBlock = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  opacity: 1;

  & > * + * {
    margin-top: ${spacing(2)};
  }

  transition:
    opacity 0.4s ease,
    transform 0.4s ease;

  ${mediaUp('md')} {
    opacity: var(--step-opacity, 1);
    transform: var(--step-transform, none);
  }
`;

const SwipeStepBlock = styled.div`
  display: grid;
  grid-template-columns: 1fr;

  & > * + * {
    margin-top: ${spacing(2)};
  }
`;

const StepRowHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${spacing(4)};
`;

const StepIconBox = styled.div`
  align-items: center;
  background-color: transparent;
  border-radius: ${radius(1)};
  display: flex;
  height: 22px;
  justify-content: center;
  width: 22px;

  &[data-active] {
    background-color: ${color('blue')};
  }
`;

const StepHeading = styled.span`
  font-family: ${fontFamily('sans')};
`;

const computeStepStyle = (
  stepNumber: number,
  activeStepIndex: number,
  localProgress: number,
): { opacity: number; transform: string } => {
  if (stepNumber > activeStepIndex + 1) {
    return { opacity: 0, transform: 'translateY(300px)' };
  }
  if (stepNumber === activeStepIndex + 1) {
    return {
      opacity: 0.4,
      transform: `translateY(${300 * (1 - localProgress)}px)`,
    };
  }
  return { opacity: 1, transform: 'translateY(0px)' };
};

export type ProductStepperContentProps = {
  activeStepIndex: number;
  layoutMode: 'scroll' | 'swipe';
  localProgress: number;
  onMobileStepIndexChange: (nextIndex: number) => void;
};

export function ProductStepperContent({
  activeStepIndex,
  layoutMode,
  localProgress,
  onMobileStepIndexChange,
}: ProductStepperContentProps) {
  const { i18n } = useLingui();

  const renderStepContent = (step: ProductStepperStep, isActive: boolean) => {
    const Icon = INFORMATIVE_MARKS[step.icon];

    return (
      <>
        <StepRowHeader>
          <StepIconBox data-active={isActive ? '' : undefined}>
            <Icon color={color('white')} sizePx={14} />
          </StepIconBox>
          <StepHeading>{i18n._(step.heading)}</StepHeading>
        </StepRowHeader>
        <Body muted size="sm">
          {i18n._(step.body)}
        </Body>
      </>
    );
  };

  return (
    <ContentRoot>
      <StepperProgressRail
        activeStepIndex={activeStepIndex}
        inactiveColor={color('black-80')}
        localProgress={localProgress}
        stepCount={PRODUCT_STEPPER_STEPS.length}
      />
      <StepsColumn>
        <IntroBlock>
          <Eyebrow>{i18n._(msg`Customization`)}</Eyebrow>
          <HeadingPair>
            <Heading as="h2" size="lg" weight="light">
              {i18n._(msg`Go the extra mile *with no-code*`)}
            </Heading>
            <Body muted size="sm">
              {i18n._(
                msg`Need a quick change? Skip the engineering ticket. Customize your workspace in minutes.`,
              )}
            </Body>
          </HeadingPair>
        </IntroBlock>
        {layoutMode === 'swipe' ? (
          <StepperSwipeDeck
            activeIndex={activeStepIndex}
            onActiveIndexChange={onMobileStepIndexChange}
            stepCount={PRODUCT_STEPPER_STEPS.length}
          >
            {(stepIndex) => (
              <SwipeStepBlock>
                {renderStepContent(
                  PRODUCT_STEPPER_STEPS[stepIndex],
                  stepIndex === activeStepIndex,
                )}
              </SwipeStepBlock>
            )}
          </StepperSwipeDeck>
        ) : (
          PRODUCT_STEPPER_STEPS.map((step, stepNumber) => {
            const { opacity, transform } = computeStepStyle(
              stepNumber,
              activeStepIndex,
              localProgress,
            );

            return (
              <StepBlock
                key={step.visual}
                style={
                  {
                    '--step-opacity': opacity,
                    '--step-transform': transform,
                  } as CSSProperties
                }
              >
                {renderStepContent(step, stepNumber <= activeStepIndex)}
              </StepBlock>
            );
          })
        )}
      </StepsColumn>
    </ContentRoot>
  );
}
