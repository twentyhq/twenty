'use client';

import { styled } from '@linaria/react';
import { useCallback, useEffect, useRef } from 'react';

import { loadVisualImage } from '../engine/load-visual-image';
import { useAsyncImage } from '../engine/use-async-image';
import { useVisualRuntime } from '../engine/use-visual-runtime';
import {
  createImageSession,
  type ImageSessionSettings,
} from './create-image-session';

const SceneContainer = styled.div`
  height: 100%;
  width: 100%;
`;

export type HalftoneImageSceneProps = {
  imageUrl: string;
  settings: ImageSessionSettings;
  pointerRootSelector?: string;
};

export function HalftoneImageScene({
  imageUrl,
  settings,
  pointerRootSelector,
}: HalftoneImageSceneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { reducedMotion } = useVisualRuntime();

  const loader = useCallback(() => loadVisualImage(imageUrl), [imageUrl]);
  const image = useAsyncImage(loader);

  useEffect(() => {
    const container = containerRef.current;
    if (container === null || image === null) {
      return;
    }

    const session = createImageSession({
      container,
      image,
      settings,
      pointerRootSelector,
      reducedMotion,
    });

    return () => {
      session?.dispose();
    };
    // settings is a config record owned by the section; stable per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, reducedMotion]);

  return <SceneContainer ref={containerRef} />;
}
