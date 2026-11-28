import { styled } from '@linaria/react';

import { color, FONT_WEIGHT, fontFamily } from '@/tokens';
import { cssVariableStyle } from '@/ui/css-variable-style';

// One light card centred in the stepper's frame. With data-scrub, every
// animation inside is paused and its playhead set by the scroll (see scrub
// below).
const Stage = styled.div`
  align-items: center;
  display: flex;
  font-family: ${fontFamily('sans')};
  height: 100%;
  justify-content: center;
  opacity: 0.7;
  transition: opacity 0.3s;
  width: 100%;

  &[data-active] {
    opacity: 1;
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

// The home stepper's dark panels: a black panel titled with an icon, rows on
// charcoal with their bottom-right corner cut, labels in mono capitals.
const ROW_CUT_PX = 10;

const Panel = styled.div`
  background: ${color('black')};
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 440px;
  padding: 8px;
  width: 86%;
`;

const PanelHeader = styled.div`
  align-items: center;
  color: ${color('white')};
  display: flex;
  font-family: ${fontFamily('sans')};
  font-size: 18px;
  font-weight: ${FONT_WEIGHT.medium};
  gap: 10px;
  padding: 10px 8px 8px;
`;

const Row = styled.div`
  align-items: center;
  background: ${color('charcoal')};
  clip-path: polygon(
    0 0,
    100% 0,
    100% calc(100% - ${ROW_CUT_PX}px),
    calc(100% - ${ROW_CUT_PX}px) 100%,
    0 100%
  );
  display: grid;
  gap: 14px;
  grid-template-columns: auto minmax(0, 1fr);
  padding: 14px 16px;
`;

const RowLabel = styled.span`
  color: ${color('silver')};
  font-family: ${fontFamily('mono')};
  font-size: 13px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const RowValue = styled.span`
  color: ${color('white')};
  font-family: ${fontFamily('sans')};
  font-size: 15px;
`;

// A quiet line under the rows: a rule, a total, a footnote.
const PanelNote = styled.span`
  color: ${color('silver')};
  font-family: ${fontFamily('mono')};
  font-size: 12px;
  letter-spacing: 0.04em;
  opacity: 0.7;
  padding: 6px 8px 4px;
  text-transform: uppercase;
`;

export const STEP_CARD_CHROME = {
  Panel,
  PanelNote,
  PanelHeader,
  Row,
  RowLabel,
  RowValue,
  scrub,
  scrubTime,
  timelineDelay,
  Stage,
};
