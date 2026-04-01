'use client';

import { useEffect, type RefObject } from 'react';

type ObserveActiveStepFromIntersectionEffectProps = {
  onActiveStepChange: (index: number) => void;
  stepRefs: RefObject<(HTMLDivElement | null)[]>;
  stepsLength: number;
};

export function ObserveActiveStepFromIntersectionEffect({
  onActiveStepChange,
  stepRefs,
  stepsLength,
}: ObserveActiveStepFromIntersectionEffectProps) {
  useEffect(() => {
    stepRefs.current = stepRefs.current.slice(0, stepsLength);

    const elements = stepRefs.current.filter(
      (element): element is HTMLDivElement => element !== null,
    );
    if (elements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const candidates = entries.filter(
          (entry) => entry.isIntersecting && entry.intersectionRatio > 0.15,
        );
        if (candidates.length === 0) {
          return;
        }

        const best = candidates.reduce((previous, current) =>
          current.intersectionRatio > previous.intersectionRatio
            ? current
            : previous,
        );
        const indexAttribute = best.target.getAttribute('data-step-index');
        const index = indexAttribute === null ? NaN : Number(indexAttribute);
        if (!Number.isNaN(index)) {
          onActiveStepChange(index);
        }
      },
      { root: null, threshold: [0, 0.15, 0.3, 0.5, 0.75, 1] },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [onActiveStepChange, stepRefs, stepsLength]);

  return null;
}
