'use client';

import { styled } from '@linaria/react';
import { DURATION } from '@/tokens';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { HalftoneImageBackdrop } from '@/platform/visuals/rigs/HalftoneImageBackdrop';

import { HERO_BACKDROP } from './hero-backdrop-config';

// Bleeds past the hero's edges so the dash field has no visible seam, and
// fades in only once the first frame has rendered (ported behavior — a
// blank canvas never flashes).
const BackdropMount = styled.div<{ $isReady: boolean }>`
  height: calc(100% + 80px);
  inset: -40px;
  opacity: ${({ $isReady }) => ($isReady ? 1 : 0)};
  pointer-events: none;
  position: absolute;
  transition: opacity ${DURATION.xl} ease;
  width: calc(100% + 80px);
`;

// Another light source keeps the bridge's settings, framed at the hero's foot.
const BOTTOM_FRAME = {
  previewDistance: 3.2,
  verticalAnchor: 0,
  verticalOffsetPx: 0,
  horizontalOffsetPx: 0,
};

type HeroBackdropProps = {
  imageUrl?: string;
};

export function HeroBackdrop({ imageUrl }: HeroBackdropProps) {
  const [isReady, setIsReady] = useState(false);
  const settings = isDefined(imageUrl)
    ? { ...HERO_BACKDROP.settings, responsiveFrame: () => BOTTOM_FRAME }
    : HERO_BACKDROP.settings;

  return (
    <BackdropMount
      $isReady={isReady}
      aria-hidden
      data-illustration="hero-bridge"
    >
      <HalftoneImageBackdrop
        imageUrl={imageUrl ?? HERO_BACKDROP.imageUrl}
        loading="eager"
        onFirstFrame={() => setIsReady(true)}
        priority
        settings={settings}
      />
    </BackdropMount>
  );
}
