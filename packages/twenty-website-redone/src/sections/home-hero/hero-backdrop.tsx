'use client';

import { styled } from '@linaria/react';
import { useState } from 'react';

import { HalftoneImageBackdrop } from '@/platform/visuals/rigs/halftone-image-backdrop';

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
  transition: opacity 600ms ease;
  width: calc(100% + 80px);
`;

export function HeroBackdrop() {
  const [isReady, setIsReady] = useState(false);

  return (
    <BackdropMount
      $isReady={isReady}
      aria-hidden
      data-illustration="hero-bridge"
    >
      <HalftoneImageBackdrop
        imageUrl={HERO_BACKDROP.imageUrl}
        loading="eager"
        onFirstFrame={() => setIsReady(true)}
        priority
        settings={HERO_BACKDROP.settings}
      />
    </BackdropMount>
  );
}
