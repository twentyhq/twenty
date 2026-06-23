'use client';

import { type RefObject, useEffect } from 'react';

type PointerCaptureCleanupEffectProps = {
  interactionRef: RefObject<HTMLDivElement | null>;
  getActivePointerId: () => number | null;
};

export function PointerCaptureCleanupEffect({
  interactionRef,
  getActivePointerId,
}: PointerCaptureCleanupEffectProps) {
  useEffect(() => {
    const layer = interactionRef.current;
    return () => {
      const pointerId = getActivePointerId();
      if (pointerId !== null && layer) {
        try {
          layer.releasePointerCapture(pointerId);
        } catch {
          // The pointer was already released by the browser.
        }
      }
    };
  }, [getActivePointerId, interactionRef]);

  return null;
}
