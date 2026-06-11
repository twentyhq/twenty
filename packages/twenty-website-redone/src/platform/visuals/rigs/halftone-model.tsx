'use client';

import dynamic from 'next/dynamic';
import { type ReactNode } from 'react';

import { type HalftoneInitialPose } from '../halftone/halftone-interaction-state';
import { type HalftoneSceneSettingsOverrides } from '../halftone/halftone-settings';
import { type LoadGlbGeometryOptions } from '../three-runtime/load-glb-geometry';
import { VisualMount } from '../engine/visual-mount';

// The ONLY import() of the heavy model pipeline: three stays out of the
// main chunk, and the fetch happens after policy + viewport + slot grant.
const HalftoneModelScene = dynamic(
  () =>
    import('../halftone/halftone-model-scene').then(
      (module) => module.HalftoneModelScene,
    ),
  { ssr: false },
);

export type HalftoneModelProps = {
  modelUrl: string;
  settings: HalftoneSceneSettingsOverrides;
  initialPose?: HalftoneInitialPose & { timeElapsed?: number };
  geometryOptions?: LoadGlbGeometryOptions;
  poster?: ReactNode;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  // Models render a designed frozen frame under reduced motion by default:
  // the artwork stays, only the travel disappears.
  reducedMotionMode?: 'poster' | 'designed';
};

export function HalftoneModel({
  modelUrl,
  settings,
  initialPose,
  geometryOptions,
  poster = null,
  priority = false,
  loading = 'lazy',
  reducedMotionMode = 'designed',
}: HalftoneModelProps) {
  return (
    <VisualMount
      loading={loading}
      poster={poster}
      priority={priority}
      reducedMotion={reducedMotionMode}
    >
      <HalftoneModelScene
        geometryOptions={geometryOptions}
        initialPose={initialPose}
        modelUrl={modelUrl}
        settings={settings}
      />
    </VisualMount>
  );
}
