import { styled } from '@linaria/react';
import { type CSSProperties } from 'react';

import { color, mediaUp } from '@/tokens';

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
    background-color: ${color('black-10')};
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

  [data-slot='plus'] {
    color: ${color('blue')};
    font-size: 12px;
    left: var(--cross-x);
    line-height: 1;
    position: absolute;
    top: var(--cross-y);
    transform: translate(-50%, -50%);
  }
`;

export type GuideCrosshairProps = {
  crossX: string;
  crossY: string;
};

export function GuideCrosshair({ crossX, crossY }: GuideCrosshairProps) {
  return (
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
      <span data-line data-slot="v-top" />
      <span data-line data-slot="v-bottom" />
      <span data-slot="plus">+</span>
    </CrosshairRoot>
  );
}
