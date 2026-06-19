'use client';

import { useEffect, useState } from 'react';

import { useTimeoutRegistry } from '@/app-preview/stage/use-timeout-registry';

import { WORKFLOW_GRAPH } from './workflow-data';

// Activates the workflow nodes one beat at a time while the visual is
// active, then loops; deactivating resets. Self-rescheduling tick on the
// house timeout registry (auto-cleanup, fake-timer-testable).
export function useWorkflowAnimation(active: boolean): Set<string> {
  const [activeNodes, setActiveNodes] = useState<Set<string>>(new Set());
  const timeouts = useTimeoutRegistry();

  useEffect(() => {
    if (!active) {
      setActiveNodes(new Set());
      return undefined;
    }

    let step = 0;
    const tick = () => {
      step += 1;
      if (step > WORKFLOW_GRAPH.animationSequence.length) {
        step = 0;
        setActiveNodes(new Set());
      } else {
        setActiveNodes(
          new Set(WORKFLOW_GRAPH.animationSequence.slice(0, step)),
        );
      }
      timeouts.schedule(tick, WORKFLOW_GRAPH.stepIntervalMs);
    };
    timeouts.schedule(tick, WORKFLOW_GRAPH.stepIntervalMs);

    return () => {
      timeouts.clearAll();
    };
  }, [active, timeouts]);

  return activeNodes;
}
