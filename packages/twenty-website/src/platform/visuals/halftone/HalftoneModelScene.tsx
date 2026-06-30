'use client';

import { styled } from '@linaria/react';
import { useCallback, useEffect, useRef } from 'react';

import { useAsyncResource } from '../engine/use-async-resource';
import { useVisualRuntime } from '../engine/use-visual-runtime';
import {
  loadGlbGeometry,
  type LoadGlbGeometryOptions,
} from '../three-runtime/load-glb-geometry';
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
};

export function HalftoneModelScene({
  modelUrl,
  settings,
  initialPose,
  geometryOptions,
}: HalftoneModelSceneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { reducedMotion } = useVisualRuntime();

  const loader = useCallback(
    () => loadGlbGeometry(modelUrl, geometryOptions),
    // geometryOptions is a config record with stable identity per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [modelUrl],
  );
  const geometry = useAsyncResource(loader);

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
            reducedMotion,
          })
        : createBandSession({
            container,
            geometry,
            settings: resolved,
            initialPose,
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
  }, [geometry, reducedMotion]);

  return <SceneContainer ref={containerRef} />;
}
