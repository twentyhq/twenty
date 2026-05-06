'use client';

import { observeElementSize } from '@/lib/dom/observe-element-size';
import { type RefObject, useEffect, useState } from 'react';

export function useScaleToFit(
  containerRef: RefObject<HTMLElement | null>,
  designWidth: number,
  designHeight: number,
  baseScale = 1,
): number {
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const element = containerRef.current;
    if (element === null) {
      return;
    }

    const compute = () => {
      const width = element.clientWidth;
      const height = element.clientHeight;
      if (width <= 0 || height <= 0) {
        return;
      }
      const fit = Math.min(width / designWidth, height / designHeight);
      setScale(baseScale * fit);
    };

    const stopObservingSize = observeElementSize(element, compute);
    compute();

    return () => {
      stopObservingSize();
    };
  }, [baseScale, containerRef, designHeight, designWidth]);

  return scale;
}
