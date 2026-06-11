'use client';

import dynamic from 'next/dynamic';
import { type ReactNode } from 'react';

import { type ImageSessionSettings } from '../halftone/create-image-session';
import { VisualMount } from '../engine/visual-mount';

// The ONLY import() of the heavy image pipeline.
const HalftoneImageScene = dynamic(
  () =>
    import('../halftone/halftone-image-scene').then(
      (module) => module.HalftoneImageScene,
    ),
  { ssr: false },
);

export type HalftoneImageBackdropProps = {
  imageUrl: string;
  settings: ImageSessionSettings;
  pointerRootSelector?: string;
  poster?: ReactNode;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  detachFromLayout?: boolean;
  // Backdrops keep their artwork under reduced motion as a frozen frame.
  reducedMotionMode?: 'poster' | 'designed';
};

export function HalftoneImageBackdrop({
  imageUrl,
  settings,
  pointerRootSelector,
  poster = null,
  priority = false,
  loading = 'lazy',
  detachFromLayout = false,
  reducedMotionMode = 'designed',
}: HalftoneImageBackdropProps) {
  return (
    <VisualMount
      detachFromLayout={detachFromLayout}
      loading={loading}
      poster={poster}
      priority={priority}
      reducedMotion={reducedMotionMode}
    >
      <HalftoneImageScene
        imageUrl={imageUrl}
        pointerRootSelector={pointerRootSelector}
        settings={settings}
      />
    </VisualMount>
  );
}
