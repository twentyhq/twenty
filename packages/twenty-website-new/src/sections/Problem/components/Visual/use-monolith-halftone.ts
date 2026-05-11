'use client';

import { useEffect, type RefObject } from 'react';
import { mountHalftoneCanvas } from './monolith-halftone-mount';

export function useMonolithHalftone({
  imageUrl,
  mountRef,
}: {
  imageUrl: string;
  mountRef: RefObject<HTMLDivElement | null>;
}) {
  useEffect(() => {
    const container = mountRef.current;

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
  }, [imageUrl, mountRef]);
}
