'use client';

import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { type CSSProperties, useRef, useState } from 'react';

import {
  ScrollProgressEffect,
  useBreakpointStepSync,
  useMediaQuery,
} from '@/platform/motion';
import { HalftoneImageBackdrop } from '@/platform/visuals/rigs/HalftoneImageBackdrop';
import {
  BREAKPOINT_PX,
  buildSchemeContext,
  color,
  DURATION,
  EASING,
  mediaUp,
  radius,
  REDUCED_MOTION,
  semanticColor,
  spacing,
} from '@/tokens';
import { Body, Heading, StepperProgressRail, StepperSwipeDeck } from '@/ui';

import { PROGRAM_PATH_BACKDROP } from './program-path-backdrop-config';
import { type ProgramStep } from './program-step.type';
import { ProgramStepVisual } from './ProgramStepVisual';

// Share of each step's scroll spent holding before the hand-off.
const HOLD_FRACTION = 0.7;

const FRAME_MASK_PATH =
  'M4 0H668a4 4 0 0 1 4 4V701a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V499L28 462V215L0 178V4a4 4 0 0 1 4-4Z';

const frameMask = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 672 705' preserveAspectRatio='none'%3E%3Cpath d='${encodeURIComponent(FRAME_MASK_PATH)}' fill='black'/%3E%3C/svg%3E")`;

// Same mechanics as sections/home-stepper, which sections cannot import.
const ScrollStage = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${spacing(10)} 0;
  min-width: 0;

  ${mediaUp('md')} {
    align-items: start;
    gap: ${spacing(12)} ${spacing(10)};
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
`;

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

  & > * + * {
    margin-top: ${spacing(4)};
  }

  ${mediaUp('md')} {
    opacity: var(--step-opacity, 0);
    transform: var(--step-transform, none);

    & > * + * {
      margin-top: ${spacing(6)};
    }
  }
`;

const SwipeStepBlock = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  max-width: 454px;
  min-width: 0;

  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

const VisualColumn = styled.div`
  min-width: 0;
  order: -1;
  width: 100%;

  ${mediaUp('md')} {
    align-items: center;
    align-self: start;
    display: flex;
    height: calc(100vh - 4.5rem);
    justify-content: center;
    order: 0;
    position: sticky;
    top: 4.5rem;
  }
`;

const VisualMeasure = styled.div`
  margin-inline: auto;
  max-width: 480px;
  min-width: 0;
  width: 100%;

  ${mediaUp('md')} {
    margin-inline: 0;
    max-width: 560px;
  }
`;

const FrameRoot = styled.div`
  aspect-ratio: 672 / 705;
  contain: layout style paint;
  position: relative;
  width: 100%;
`;

const MaskedBackdrop = styled.div`
  background-color: ${color('graphite')};
  inset: 0;
  isolation: isolate;
  mask-image: ${frameMask};
  mask-position: center;
  mask-repeat: no-repeat;
  mask-size: 100% 100%;
  overflow: hidden;
  position: absolute;
  z-index: 0;
`;

const SlideArea = styled.div`
  align-items: center;
  display: flex;
  inset: 0;
  justify-content: center;
  position: absolute;
  z-index: 1;
`;

const FrameBorder = styled.svg`
  inset: 0;
  overflow: visible;
  pointer-events: none;
  position: absolute;
  z-index: 2;
`;

// Our three artefacts, one at a time, on a black card over the halftone.
// The card keeps the dark scheme inside the muted section.
const Card = styled.div`
  ${buildSchemeContext('dark')}
  background-color: ${color('black')};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  height: 46%;
  position: relative;
  width: 74%;
`;

const Frame = styled.div`
  align-items: center;
  display: flex;
  inset: 0;
  justify-content: center;
  opacity: 0;
  padding: ${spacing(8)};
  position: absolute;
  transform: translate3d(0, 16px, 0);
  transition:
    opacity ${DURATION.lg} ${EASING.gentle},
    transform ${DURATION.lg} ${EASING.standard};

  &[data-active] {
    opacity: 1;
    transform: none;
  }

  ${REDUCED_MOTION} {
    transform: none;
    transition: none;
  }
`;

const computeStepStyle = (
  index: number,
  activeStepIndex: number,
  localProgress: number,
  stepCount: number,
): { opacity: number; transform: string } => {
  if (index === activeStepIndex) {
    if (index === stepCount - 1 || localProgress <= HOLD_FRACTION) {
      return { opacity: 1, transform: 'translateY(0)' };
    }
    const t = Math.min(
      1,
      (localProgress - HOLD_FRACTION) / (1 - HOLD_FRACTION),
    );
    return { opacity: 1 - t, transform: `translateY(${-40 * t}vh)` };
  }
  if (index === activeStepIndex + 1 && localProgress > HOLD_FRACTION) {
    const t = Math.min(
      1,
      (localProgress - HOLD_FRACTION) / (1 - HOLD_FRACTION),
    );
    return { opacity: t, transform: `translateY(${40 * (1 - t)}vh)` };
  }
  return { opacity: 0, transform: 'translateY(40vh)' };
};

type ProgramPathScrollerProps = {
  // 'eager' has the backdrop drawn before the section is reached, at the cost
  // of one of the page's six WebGL contexts from the start.
  backdropLoading?: 'lazy' | 'eager';
  steps: readonly ProgramStep[];
};

export function ProgramPathScroller({
  backdropLoading = 'lazy',
  steps,
}: ProgramPathScrollerProps) {
  const { i18n } = useLingui();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isMdUp = useMediaQuery(`(min-width: ${BREAKPOINT_PX.md}px)`);
  const [scrollProgress, setScrollProgress] = useState(0);
  const {
    activeStepIndex,
    localProgress,
    mobileStepIndex,
    setMobileStepIndex,
  } = useBreakpointStepSync(isMdUp, scrollProgress, steps.length);
  const visualIndex = isMdUp ? activeStepIndex : mobileStepIndex;

  const renderStepContent = (step: ProgramStep) => (
    <>
      <Heading as="h3" size="lg" weight="light">
        {i18n._(step.title)}
      </Heading>
      <Body muted size="sm">
        {i18n._(step.body)}
      </Body>
    </>
  );

  return (
    <>
      <ScrollProgressEffect
        enabled={isMdUp}
        onScrollProgress={setScrollProgress}
        scrollContainerRef={scrollContainerRef}
      />
      <ScrollStage ref={scrollContainerRef}>
        <StepsRoot>
          <StickyPanel>
            <StepperProgressRail
              activeStepIndex={activeStepIndex}
              localProgress={localProgress}
              stepCount={steps.length}
            />
            <StepsContainer>
              {isMdUp ? (
                steps.map((step, index) => {
                  const { opacity, transform } = computeStepStyle(
                    index,
                    activeStepIndex,
                    localProgress,
                    steps.length,
                  );

                  return (
                    <StepBlock
                      key={step.title.id}
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
              ) : (
                <StepperSwipeDeck
                  activeIndex={mobileStepIndex}
                  onActiveIndexChange={setMobileStepIndex}
                  stepCount={steps.length}
                >
                  {(stepIndex) => (
                    <SwipeStepBlock>
                      {renderStepContent(steps[stepIndex])}
                    </SwipeStepBlock>
                  )}
                </StepperSwipeDeck>
              )}
            </StepsContainer>
          </StickyPanel>
          <SpacerStack>
            {steps.map((step) => (
              <StepSpacer key={step.title.id} />
            ))}
          </SpacerStack>
        </StepsRoot>
        <VisualColumn aria-hidden>
          <VisualMeasure>
            <FrameRoot data-program-path-pointer-root="">
              <MaskedBackdrop data-illustration="program-path-backdrop">
                <HalftoneImageBackdrop
                  imageUrl={PROGRAM_PATH_BACKDROP.imageUrl}
                  loading={backdropLoading}
                  pointerRootSelector="[data-program-path-pointer-root]"
                  reducedMotionMode="poster"
                  settings={PROGRAM_PATH_BACKDROP.settings}
                />
              </MaskedBackdrop>
              <SlideArea>
                <Card>
                  {steps.map((step, index) => (
                    <Frame
                      data-active={index === visualIndex ? '' : undefined}
                      key={step.title.id}
                    >
                      <ProgramStepVisual visual={step.visual} />
                    </Frame>
                  ))}
                </Card>
              </SlideArea>
              <FrameBorder preserveAspectRatio="none" viewBox="0 0 672 705">
                <path
                  d={FRAME_MASK_PATH}
                  fill="none"
                  stroke={color('silver')}
                  strokeLinejoin="round"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
              </FrameBorder>
            </FrameRoot>
          </VisualMeasure>
        </VisualColumn>
      </ScrollStage>
    </>
  );
}
