import { useEffect, useRef, useState } from 'react';

import { ANIMATION_SEQUENCE, STEP_INTERVAL_MS } from './data/workflow.data';

export function useWorkflowAnimation(active: boolean) {
  const [activeNodes, setActiveNodes] = useState<Set<string>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepRef = useRef(0);

  useEffect(() => {
    if (!active) {
      setActiveNodes(new Set());
      stepRef.current = 0;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      stepRef.current += 1;
      if (stepRef.current > ANIMATION_SEQUENCE.length) {
        stepRef.current = 0;
        setActiveNodes(new Set());
      } else {
        setActiveNodes(new Set(ANIMATION_SEQUENCE.slice(0, stepRef.current)));
      }
    }, STEP_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [active]);

  return activeNodes;
}
