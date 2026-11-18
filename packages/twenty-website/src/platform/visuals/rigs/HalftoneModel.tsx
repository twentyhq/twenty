'use client';

import { styled } from '@linaria/react';
import dynamic from 'next/dynamic';
import { type ReactNode, useCallback, useState } from 'react';

import { type HalftoneInitialPose } from '../halftone/halftone-interaction-state';
import { type HalftoneSceneSettingsOverrides } from '../halftone/halftone-settings';
import { type HalftoneModelSceneProps } from '../halftone/HalftoneModelScene';
import { type LoadGlbGeometryOptions } from '../three-runtime/load-glb-geometry';
import { VisualMount } from '../engine/VisualMount';

// The ONLY import() of the heavy model pipeline: three stays out of the
// main chunk, and the fetch happens after policy + viewport + slot grant.
const HalftoneModelScene = dynamic(
  () =>
    import('../halftone/HalftoneModelScene').then(
      (module) => module.HalftoneModelScene,
    ),
  { ssr: false },
);

const ModelLayers = styled.div`
  display: grid;
  grid-template: minmax(0, 1fr) / minmax(0, 1fr);
  height: 100%;
  width: 100%;

  & > * {
    grid-area: 1 / 1;
  }
`;

function ModelSceneWithPoster({
  poster,
  ...sceneProps
}: HalftoneModelSceneProps & { poster: ReactNode }) {
  const [hasFrame, setHasFrame] = useState(false);
  const onFirstFrame = useCallback(() => setHasFrame(true), []);

  return (
    <ModelLayers>
      {!hasFrame && poster}
      <HalftoneModelScene {...sceneProps} onFirstFrame={onFirstFrame} />
    </ModelLayers>
  );
}

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
  const sceneProps = { geometryOptions, initialPose, modelUrl, settings };

  return (
    <VisualMount
      loading={loading}
      poster={poster}
      priority={priority}
      reducedMotion={reducedMotionMode}
    >
      {poster === null ? (
        <HalftoneModelScene {...sceneProps} />
      ) : (
        <ModelSceneWithPoster key={modelUrl} {...sceneProps} poster={poster} />
      )}
    </VisualMount>
  );
}
