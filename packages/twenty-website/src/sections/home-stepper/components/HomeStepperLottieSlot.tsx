'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

import { observeElementVisibility } from '@/platform/visuals/engine/observe-element-visibility';

// @lottiefiles/dotlottie-react is ~316KB driving a decorative animation well
// below the fold. A plain dynamic import is not enough: HomeStepper is in the
// initial HTML, so the import fires on mount and the chunk still downloads and
// evaluates before first paint. Gating the render on visibility is what keeps it
// off the critical path.
const HomeStepperLottie = dynamic(
  () =>
    import('./HomeStepperLottie').then((module) => module.HomeStepperLottie),
  { ssr: false },
);

// Matches VisualMount's lazy margin so the animation is ready by the time it
// scrolls in.
const LAZY_ROOT_MARGIN = '50% 0px 50% 0px';

export function HomeStepperLottieSlot({
  scrollProgress,
}: {
  scrollProgress: number;
}) {
  const slotRef = useRef<HTMLDivElement>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);

  useEffect(() => {
    const element = slotRef.current;

    if (element === null || isNearViewport) {
      return;
    }

    return observeElementVisibility(
      element,
      (isVisible) => {
        if (isVisible) {
          setIsNearViewport(true);
        }
      },
      { rootMargin: LAZY_ROOT_MARGIN },
    );
  }, [isNearViewport]);

  return (
    <div ref={slotRef} style={{ height: '100%', width: '100%' }}>
      {isNearViewport ? (
        <HomeStepperLottie scrollProgress={scrollProgress} />
      ) : null}
    </div>
  );
}
