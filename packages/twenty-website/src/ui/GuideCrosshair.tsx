import { styled } from '@linaria/react';
import { type CSSProperties } from 'react';

import { color, MAX_CONTENT_WIDTH_PX, mediaUp, semanticColor } from '@/tokens';

// Decorative guide lines crossing at a point, with a gap and a blue plus at
// the intersection — desktop only. Position arrives via CSS variables.
const CrosshairRoot = styled.div`
  display: none;

  ${mediaUp('md')} {
    display: block;
    inset: 0;
    pointer-events: none;
    position: absolute;
  }

  [data-line] {
    background-color: ${semanticColor.line};
    position: absolute;
  }

  [data-slot='h-left'] {
    height: 1px;
    left: 0;
    top: var(--cross-y);
    width: calc(var(--cross-x) - var(--cross-gap));
  }

  [data-slot='h-right'] {
    height: 1px;
    right: 0;
    top: var(--cross-y);
    width: calc(100% - var(--cross-x) - var(--cross-gap));
  }

  [data-slot='v-top'] {
    height: calc(var(--cross-y) - var(--cross-gap));
    left: var(--cross-x);
    top: 0;
    width: 1px;
  }

  [data-slot='v-bottom'] {
    height: calc(100% - var(--cross-y) - var(--cross-gap));
    left: var(--cross-x);
    top: calc(var(--cross-y) + var(--cross-gap));
    width: 1px;
  }

  /* When a scene draws its own full-height guide behind this crosshair,
     the eraser re-creates the designed gap around the plus — and tracks it
     through sticky scrolling, which a static gap in the line cannot. */
  [data-slot='v-eraser'] {
    background: ${semanticColor.surface};
    height: calc(var(--cross-gap) * 2);
    left: var(--cross-x);
    position: absolute;
    top: var(--cross-y);
    transform: translate(-50%, -50%);
    width: 3px;
  }

  /* CSS-drawn full-bleed plus, as authored (a text glyph only fills ~60%
     of its box). */
  [data-slot='plus'] {
    height: 12px;
    left: var(--cross-x);
    position: absolute;
    top: var(--cross-y);
    transform: translate(-50%, -50%);
    width: 12px;

    &::before {
      background: ${color('blue')};
      content: '';
      height: 100%;
      left: 50%;
      position: absolute;
      top: 0;
      transform: translateX(-50%);
      width: 1px;
    }

    &::after {
      background: ${color('blue')};
      content: '';
      height: 1px;
      left: 0;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 100%;
    }
  }
`;

export type GuideCrosshairProps = {
  // Bounds the lines to the content max-width instead of the full section, so
  // they stay within the content column rather than bleeding into the gutters.
  contained?: boolean;
  crossX: string;
  crossY: string;
  // Scenes that draw their own full-height vertical guide disable these.
  verticalLines?: boolean;
};

const CrosshairBounds = styled.div`
  height: 100%;
  margin-inline: auto;
  max-width: ${MAX_CONTENT_WIDTH_PX}px;
  position: relative;
  width: 100%;
`;

export function GuideCrosshair({
  contained = false,
  crossX,
  crossY,
  verticalLines = true,
}: GuideCrosshairProps) {
  const crosshair = (
    <CrosshairRoot
      aria-hidden
      style={
        {
          '--cross-x': crossX,
          '--cross-y': crossY,
          '--cross-gap': '18px',
        } as CSSProperties
      }
    >
      <span data-line data-slot="h-left" />
      <span data-line data-slot="h-right" />
      {verticalLines && <span data-line data-slot="v-top" />}
      {verticalLines && <span data-line data-slot="v-bottom" />}
      {!verticalLines && <span data-slot="v-eraser" />}
      <span data-slot="plus" />
    </CrosshairRoot>
  );

  return contained ? <CrosshairBounds>{crosshair}</CrosshairBounds> : crosshair;
}
