'use client';

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

    const observer = new ResizeObserver(compute);
    observer.observe(element);
    compute();

    return () => {
      observer.disconnect();
    };
  }, [baseScale, containerRef, designHeight, designWidth]);

  return scale;
}
