import { styled } from '@linaria/react';

import { color, mediaUp } from '@/tokens';

// The stage's shape is a grammar, not a picture: a rounded rectangle with a
// channel notched into the right edge between two bevels. The bevels keep
// fixed geometry (small SVG masks); the flat runs are gradient bands that
// stretch — so the stage renders correctly at ANY size, wide band or tall
// column, with zero distortion. (The old site stretched two fixed-size
// masks with preserveAspectRatio="none".)
const BEVEL_TOP_PATH = 'M0 0H24C24 10 14 19 0 26Z';
const BEVEL_BOTTOM_PATH = 'M0 2C14 9 24 18 24 28H0Z';

const bevelMask = (path: string): string =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 28' preserveAspectRatio='none'%3E%3Cpath d='${encodeURIComponent(path)}' fill='black'/%3E%3C/svg%3E")`;

const OPAQUE = 'linear-gradient(#000, #000)';

const MaskedStage = styled.div`
  --notch-depth: 14px;
  --channel-top: 40px;
  --channel-length: 160px;

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
    0 calc(var(--channel-top) + var(--channel-length) + 56px),
    right 0 top var(--channel-top),
    right 0 top calc(var(--channel-top) + var(--channel-length) + 28px);
  mask-repeat: no-repeat;
  mask-size:
    100% var(--channel-top),
    calc(100% - var(--notch-depth)) calc(var(--channel-length) + 56px),
    100% calc(100% - var(--channel-top) - var(--channel-length) - 56px),
    var(--notch-depth) 28px,
    var(--notch-depth) 28px;
  width: 100%;

  ${mediaUp('md')} {
    --notch-depth: 24px;
    --channel-top: 70px;
    --channel-length: 240px;

    height: 100%;
  }
`;

export function ProblemVisual() {
  return <MaskedStage aria-hidden />;
}
