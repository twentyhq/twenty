'use client';

import { styled } from '@linaria/react';
import { useCallback, useEffect, useRef, type RefObject } from 'react';

import { loadVisualImage } from '../engine/load-visual-image';
import { useAsyncImage } from '../engine/use-async-image';
import {
  createCardHalftoneSession,
  type CardHalftoneConfig,
} from './create-card-halftone-session';

const SceneContainer = styled.div`
  height: 100%;
  width: 100%;
`;

export type CardHalftoneSceneProps = {
  imageUrl: string;
  config: CardHalftoneConfig;
  active?: boolean;
  pointerTargetRef?: RefObject<HTMLElement | null>;
  onFirstFrame?: () => void;
};

export function CardHalftoneScene({
  imageUrl,
  config,
  active = false,
  pointerTargetRef,
  onFirstFrame,
}: CardHalftoneSceneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef(active);
  activeRef.current = active;
  const wakeRef = useRef<(() => void) | null>(null);

  const loader = useCallback(() => loadVisualImage(imageUrl), [imageUrl]);
  const image = useAsyncImage(loader);

  useEffect(() => {
    const container = containerRef.current;
    if (container === null || image === null) {
      return;
    }

    const session = createCardHalftoneSession({
      config,
      container,
      image,
      isExternallyActive: () => activeRef.current,
      pointerTarget: pointerTargetRef?.current,
      onFirstFrame,
    });

    wakeRef.current = session?.wake ?? null;

    return () => {
      wakeRef.current = null;
      session?.dispose();
    };
    // config is an authored record owned by the section; stable per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image]);

  // The hover handoff: card hover wakes the loop so the authored-anchor
  // light can ease in.
  useEffect(() => {
    wakeRef.current?.();
  }, [active]);

  return <SceneContainer ref={containerRef} />;
}
