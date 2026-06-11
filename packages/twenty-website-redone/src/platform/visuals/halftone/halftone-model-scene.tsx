'use client';

import { styled } from '@linaria/react';
import { useCallback, useEffect, useRef } from 'react';

import { useAsyncResource } from '../engine/use-async-resource';
import { useVisualRuntime } from '../engine/use-visual-runtime';
import { loadGlbGeometry } from '../three-runtime/load-glb-geometry';
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
  scaleTarget?: number;
};

export function HalftoneModelScene({
  modelUrl,
  settings,
  initialPose,
  scaleTarget,
}: HalftoneModelSceneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { reducedMotion } = useVisualRuntime();

  const loader = useCallback(
    () => loadGlbGeometry(modelUrl, { scaleTarget }),
    [modelUrl, scaleTarget],
  );
  const geometry = useAsyncResource(loader);

  useEffect(() => {
    const container = containerRef.current;
    if (container === null || geometry === null) {
      return;
    }

    const session = createHalftoneSession({
      container,
      geometry,
      settings: resolveHalftoneSettings(settings),
      initialPose,
      reducedMotion,
    });

    return () => {
      session?.dispose();
    };
    // settings/initialPose are config records owned by the section; their
    // identity is stable for the life of the mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geometry, reducedMotion]);

  return <SceneContainer ref={containerRef} />;
}
