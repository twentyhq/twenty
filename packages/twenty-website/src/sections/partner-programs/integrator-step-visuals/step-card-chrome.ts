import { styled } from '@linaria/react';

import { PRODUCT_STEPPER_SCENE } from '@/tokens/feature-scenes/product-stepper-scene';
import { cssVariableStyle } from '@/ui/css-variable-style';

const shell = PRODUCT_STEPPER_SCENE.shell;

// The product stepper's light-window fiction: one card in the frame, either
// centred or, with data-anchor="corner", running off its bottom-right edge
// like a window seen in part. With data-scrub, every animation inside is
// paused and its playhead set by the scroll (see scrub below).
const Stage = styled.div`
  align-items: center;
  display: flex;
  font-family: ${shell.font};
  height: 100%;
  justify-content: center;
  opacity: 0.7;
  transition: opacity 0.3s;
  width: 100%;

  &[data-active] {
    opacity: 1;
  }

  &[data-anchor='corner'] {
    position: relative;
  }

  &[data-scrub] * {
    animation-play-state: paused !important;
  }
`;

// Each animated element starts at its own --d in a step's timeline. Scrubbed,
// --scrub moves the playhead: a paused animation whose delay is negative sits
// that far into its run, like HomeStepper's Lottie frame follows the scroll.
const timelineDelay = 'calc(var(--d, 0ms) - var(--scrub, 0ms))';

// The timeline is done once the reader is three quarters through the step,
// so the finished card holds for the rest of it.
const SCRUB_COMPLETE_AT = 0.75;

// Where the playhead sits in a timeline for a given scroll progress.
const scrubTime = (progress: number, timelineMs: number) =>
  Math.round(Math.min(1, progress / SCRUB_COMPLETE_AT) * timelineMs);

const scrub = (progress: number | undefined, timelineMs: number) =>
  progress === undefined
    ? {}
    : {
        'data-scrub': '',
        style: cssVariableStyle({
          '--scrub': `${scrubTime(progress, timelineMs)}ms`,
        }),
      };

// ProductStepperVisualFrame insets its slides by 6% of the frame; the corner
// card cancels that inset so it meets the frame's right and bottom edges.
const FRAME_INSET_RATIO = 0.06;
const cornerBleed = `calc(-100% * ${FRAME_INSET_RATIO} / ${1 - 2 * FRAME_INSET_RATIO})`;

const Card = styled.div`
  background: ${shell.background};
  border: 1px solid ${shell.borderMedium};
  border-radius: 8px;
  box-shadow: ${PRODUCT_STEPPER_SCENE.cardShadow};
  display: flex;
  flex-direction: column;
  max-width: 440px;
  width: 86%;

  [data-anchor='corner'] > & {
    border-bottom: none;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 4px;
    border-right: none;
    border-top-right-radius: 0;
    bottom: ${cornerBleed};
    height: 84%;
    max-width: none;
    overflow: hidden;
    position: absolute;
    right: ${cornerBleed};
    width: 84%;
  }
`;

const CardHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${shell.borderLight};
  color: ${shell.text};
  display: flex;
  font-size: 15px;
  font-weight: 500;
  gap: 8px;
  padding: 16px 20px;
`;

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
`;

const Label = styled.span`
  color: ${shell.textTertiary};
  font-size: 13px;
  font-weight: 500;
`;

const Value = styled.span`
  color: ${shell.text};
  font-size: 14px;
`;

export const STEP_CARD_CHROME = {
  scrub,
  scrubTime,
  timelineDelay,
  Card,
  CardBody,
  CardHeader,
  Label,
  Stage,
  Value,
};
