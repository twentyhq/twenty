'use client';

import { useEffect, useState, type RefObject } from 'react';

import { createAnimationFrameLoop } from '@/platform/motion';

const FILTER_ROW_GAP = 4;

// Measures where the floating "Add filter" sits: parked after the
// Employees chip, docked after the Type chip once Employees is removed.
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
