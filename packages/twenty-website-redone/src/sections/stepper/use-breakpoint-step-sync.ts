'use client';

import { useEffect, useRef, useState } from 'react';

// Keeps the mobile swipe index continuous with the desktop scroll position
// when the viewport crosses the breakpoint mid-interaction.
export function useBreakpointStepSync(
  isMdUp: boolean,
  scrollProgress: number,
  stepCount: number,
) {
  const [mobileStepIndex, setMobileStepIndex] = useState(0);
  const previousMdUpRef = useRef(isMdUp);

  useEffect(() => {
    if (previousMdUpRef.current && !isMdUp) {
      setMobileStepIndex(
        Math.min(stepCount - 1, Math.floor(scrollProgress * stepCount)),
      );
    }
    previousMdUpRef.current = isMdUp;
  }, [isMdUp, scrollProgress, stepCount]);

  const activeStepIndex = isMdUp
    ? Math.min(stepCount - 1, Math.floor(scrollProgress * stepCount))
    : mobileStepIndex;
  const localProgress = isMdUp
    ? scrollProgress * stepCount - activeStepIndex
    : 0;

  return {
    activeStepIndex,
    localProgress,
    mobileStepIndex,
    setMobileStepIndex,
  };
}
