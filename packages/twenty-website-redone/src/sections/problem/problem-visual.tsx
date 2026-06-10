import { styled } from '@linaria/react';

import { color, mediaUp } from '@/tokens';

// The stage's shape is a grammar, not a picture: a rounded rectangle with a
// channel notched into the right edge between two bevels. The bevels keep
// fixed geometry (small SVG masks); the flat runs are gradient bands that
// stretch — so the stage renders correctly at ANY size, wide band or tall
// column, with zero distortion. (The old site stretched two fixed-size
// masks with preserveAspectRatio="none".)
// Authored bevel profile: a ~50deg diagonal with small ease arcs at both
// ends (ported from the original mask path), not a rounded quarter-curve.
const BEVEL_TOP_PATH =
  'M0 0H24C24 2.4 23.7 4.7 22.5 6.5L2.5 30A10 10 0 0 1 0 36.5Z';
const BEVEL_BOTTOM_PATH =
  'M0 3.5A10 10 0 0 1 2.5 10L22.5 33.5C23.7 35.3 24 37.6 24 40H0Z';

const bevelMask = (path: string): string =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 40' preserveAspectRatio='none'%3E%3Cpath d='${encodeURIComponent(path)}' fill='black'/%3E%3C/svg%3E")`;

const OPAQUE = 'linear-gradient(#000, #000)';

const MaskedStage = styled.div`
  --notch-depth: 14px;
  --channel-top: 40px;
  --channel-length: 160px;
  --bevel: 22px;

  background-color: ${color('black')};
  border-radius: 4px;
  height: clamp(360px, 48vw, 460px);
  isolation: isolate;
  mask-image:
    ${OPAQUE}, ${OPAQUE}, ${OPAQUE}, ${bevelMask(BEVEL_TOP_PATH)},
    ${bevelMask(BEVEL_BOTTOM_PATH)};
  mask-position:
    0 0,
    0 var(--channel-top),
    0 calc(var(--channel-top) + var(--channel-length) + var(--bevel) * 2),
    right 0 top var(--channel-top),
    right 0 top calc(var(--channel-top) + var(--bevel) + var(--channel-length));
  mask-repeat: no-repeat;
  mask-size:
    100% var(--channel-top),
    calc(100% - var(--notch-depth))
      calc(var(--channel-length) + var(--bevel) * 2),
    100%
      calc(100% - var(--channel-top) - var(--channel-length) - var(--bevel) * 2),
    var(--notch-depth) var(--bevel),
    var(--notch-depth) var(--bevel);
  width: 100%;

  ${mediaUp('md')} {
    --notch-depth: 24px;
    --channel-top: 70px;
    --channel-length: 240px;
    --bevel: 40px;

    height: 100%;
  }
`;

export function ProblemVisual() {
  return <MaskedStage aria-hidden />;
}
