'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { DEFAULT_TUNING, mountHalftoneCanvas } from './monolith-halftone-mount';

const IMAGE_SRC = '/images/home/problem/monolith-problem.webp';

type MonolithProps = {
  imageUrl?: string;
  style?: CSSProperties;
};

export default function Monolith({
  imageUrl = IMAGE_SRC,
  style,
}: MonolithProps) {
  const mountReference = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountReference.current;

    if (!container) {
      return;
    }

    const abortController = new AbortController();
    const unmountPromise = mountHalftoneCanvas({
      container,
      imageUrl,
      signal: abortController.signal,
    }).catch((error) => {
      if (error.name !== 'AbortError') {
        console.error(error);
      }
      return undefined;
    });

    return () => {
      abortController.abort();
      void unmountPromise.then((dispose) => dispose?.());
    };
  }, [imageUrl]);

  return (
    <div
      ref={mountReference}
      style={{
        background: DEFAULT_TUNING.backgroundColor,
        height: '100%',
        width: '100%',
        ...style,
      }}
    />
  );
}
