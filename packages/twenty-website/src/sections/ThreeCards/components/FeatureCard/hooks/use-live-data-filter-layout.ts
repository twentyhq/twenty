'use client';

import { type RefObject, useEffect, useState } from 'react';

import { createAnimationFrameLoop } from '@/lib/animation';

import { FILTER_ROW_GAP } from '../utils/live-data-visual.styles';

export function useLiveDataFilterLayout(
  typeFilterRef: RefObject<HTMLDivElement | null>,
  employeesFilterRef: RefObject<HTMLDivElement | null>,
) {
  const [addFilterLefts, setAddFilterLefts] = useState<{
    docked: number;
    parked: number;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;

    const measureAddFilterLefts = () => {
      if (!isMounted) {
        return;
      }

      const typeFilter = typeFilterRef.current;
      const employeesFilter = employeesFilterRef.current;

      if (
        !typeFilter ||
        !employeesFilter ||
        employeesFilter.offsetWidth === 0
      ) {
        return;
      }

      const nextLefts = {
        docked: typeFilter.offsetLeft + typeFilter.offsetWidth + FILTER_ROW_GAP,
        parked:
          employeesFilter.offsetLeft +
          employeesFilter.offsetWidth +
          FILTER_ROW_GAP,
      };

      setAddFilterLefts((current) =>
        current?.docked === nextLefts.docked &&
        current?.parked === nextLefts.parked
          ? current
          : nextLefts,
      );
    };

    const measureTask = createAnimationFrameLoop({
      onFrame: () => {
        measureAddFilterLefts();
        return false;
      },
    });

    measureTask.start();
    window.addEventListener('resize', measureAddFilterLefts);
    void document.fonts?.ready.then(measureAddFilterLefts);

    return () => {
      isMounted = false;
      measureTask.stop();
      window.removeEventListener('resize', measureAddFilterLefts);
    };
  }, [typeFilterRef, employeesFilterRef]);

  return addFilterLefts;
}
