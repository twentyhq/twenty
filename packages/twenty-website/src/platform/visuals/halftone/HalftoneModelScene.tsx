'use client';

import { styled } from '@linaria/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAsyncResource } from '../engine/use-async-resource';
import { useVisualRuntime } from '../engine/use-visual-runtime';
import {
  loadGlbGeometry,
  type LoadGlbGeometryOptions,
} from '../three-runtime/load-glb-geometry';
import {
  type HalftoneModelStack,
  stackGeometry,
} from '../three-runtime/stack-geometry';
import { createBandSession } from './create-band-session';
import { createHalftoneSession } from './create-halftone-session';
import { type HalftoneInitialPose } from './halftone-interaction-state';
import {
  resolveHalftoneSettings,
  type HalftoneSceneSettingsOverrides,
} from './halftone-settings';

const SceneContainer = styled.div`
  height: 100%;
  width: 100%;
`;

export type HalftoneModelSceneProps = {
  modelUrl: string;
  settings: HalftoneSceneSettingsOverrides;
  initialPose?: HalftoneInitialPose & { timeElapsed?: number };
  geometryOptions?: LoadGlbGeometryOptions;
  // Draws several copies of the model in the one canvas; changing `visible`
  // shows more or fewer without rebuilding the scene.
  stack?: HalftoneModelStack;
  onFirstFrame?: () => void;
};

export function HalftoneModelScene({
  modelUrl,
  settings,
  initialPose,
  geometryOptions,
  stack,
  onFirstFrame,
}: HalftoneModelSceneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { reducedMotion } = useVisualRuntime();

  const loader = useCallback(
    () => loadGlbGeometry(modelUrl, geometryOptions),
    // geometryOptions is a config record with stable identity per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [modelUrl],
  );
  const loadedGeometry = useAsyncResource(loader);
  const stacked = useMemo(
    () =>
      loadedGeometry !== null && stack !== undefined
        ? stackGeometry(loadedGeometry, stack)
        : null,
    // the stack's layout is a config record, stable per mount; only its
    // visible count changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loadedGeometry],
  );
  const geometry = stacked?.geometry ?? loadedGeometry;
  const visibleCopies = stack?.visible;

  // The stack's copies start moving once the canvas shows them.
  const [hasFrame, setHasFrame] = useState(false);
  const handleFirstFrame = useCallback(() => {
    setHasFrame(true);
    onFirstFrame?.();
  }, [onFirstFrame]);

  useEffect(() => {
    if (stacked === null || visibleCopies === undefined || !hasFrame) {
      return;
    }
    stacked.setVisible(visibleCopies, !reducedMotion);
  }, [stacked, visibleCopies, hasFrame, reducedMotion]);

  useEffect(() => () => stacked?.dispose(), [stacked]);

  useEffect(() => {
    const container = containerRef.current;
    if (container === null || geometry === null) {
      return;
    }

    const resolved = resolveHalftoneSettings(settings);
    let cancelled = false;
    let session: { dispose: () => void } | null = null;

    void Promise.resolve(
      resolved.halftone.variant === 'rows'
        ? createHalftoneSession({
            container,
            geometry,
            settings: resolved,
            initialPose,
            onFirstFrame: handleFirstFrame,
            reducedMotion,
          })
        : createBandSession({
            container,
            geometry,
            settings: resolved,
            initialPose,
            onFirstFrame: handleFirstFrame,
            reducedMotion,
          }),
    ).then((createdSession) => {
      if (cancelled) {
        createdSession?.dispose();
        return;
      }
      session = createdSession;
    });

    return () => {
      cancelled = true;
      session?.dispose();
    };
    // settings/initialPose are config records owned by the section; their
    // identity is stable for the life of the mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geometry, handleFirstFrame, reducedMotion]);

  return <SceneContainer ref={containerRef} />;
}
