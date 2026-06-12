'use client';

import dynamic from 'next/dynamic';
import { type ReactNode, type RefObject } from 'react';

import { type CardHalftoneConfig } from '../halftone/create-card-halftone-session';
import { VisualMount } from '../engine/visual-mount';

// The ONLY import() of the card halftone pipeline.
const CardHalftoneScene = dynamic(
  () =>
    import('../halftone/card-halftone-scene').then(
      (module) => module.CardHalftoneScene,
    ),
  { ssr: false },
);

export type HalftoneCardBackdropProps = {
  imageUrl: string;
  config: CardHalftoneConfig;
  active?: boolean;
  pointerTargetRef?: RefObject<HTMLElement | null>;
  poster?: ReactNode;
  // The artwork stays under reduced motion as on the old site (the scene
  // idles static; only pointer interaction animates it).
  reducedMotionMode?: 'poster' | 'designed';
};

export function HalftoneCardBackdrop({
  imageUrl,
  config,
  active = false,
  pointerTargetRef,
  poster = null,
  reducedMotionMode = 'designed',
}: HalftoneCardBackdropProps) {
  return (
    <VisualMount
      detachFromLayout
      poster={poster}
      reducedMotion={reducedMotionMode}
    >
      <CardHalftoneScene
        active={active}
        config={config}
        imageUrl={imageUrl}
        pointerTargetRef={pointerTargetRef}
      />
    </VisualMount>
  );
}
