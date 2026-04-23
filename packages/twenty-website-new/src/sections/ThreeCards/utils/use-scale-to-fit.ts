'use client';

import { type RefObject, useEffect, useState } from 'react';

/**
 * Compute a uniform scale factor that fits a fixed-design-size scene into
 * its container, observed live with ResizeObserver. Returns 0 until the
 * container has a measurable size (so consumers can hide the scene during
 * the very first paint and avoid flashing it at the wrong scale).
 *
 * Why this exists
 * ───────────────
 * The previous implementation used CSS container query units inside
 * `transform: scale(min(100cqw / W, 100cqh / H))`. That works in Chrome
 * but fails on Firefox in this exact tree (`container-type: size` element
 * sitting inside `position: absolute` ancestors that themselves have a
 * `transform`). Firefox would resolve `cqw`/`cqh` against the viewport
 * instead of the query container, blowing the scale up and pushing the
 * visible scene off the right edge of the card.
 *
 * Computing the scale in JS removes the container-query dependency and
 * gives us identical behaviour on every browser, on every breakpoint.
 */
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
