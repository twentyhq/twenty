'use client';

import { useEffect, useState } from 'react';

import {
  evaluateWebGlPolicy,
  type WebGlPolicyDecision,
} from './visual-runtime-policy';

const PESSIMISTIC_INITIAL_DECISION: WebGlPolicyDecision = {
  allowed: false,
  reason: 'no-webgl-support',
  reducedMotion: false,
};

/**
 * Returns the current WebGL eligibility decision for this device.
 *
 * SSR returns the pessimistic decision (so server-rendered HTML never
 * claims a canvas is mounted); the real client decision is computed in
 * an effect on first commit and re-computed when `prefers-reduced-motion`
 * changes.
 *
 * The page-wide context budget is intentionally NOT a re-render trigger
 * here — `WebGlMount` enforces it directly by reserving a slot at mount
 * time, so it never needs to be re-evaluated as part of the policy.
 */
export function useWebGlPolicy(): WebGlPolicyDecision {
  const [decision, setDecision] = useState<WebGlPolicyDecision>(
    PESSIMISTIC_INITIAL_DECISION,
  );

  useEffect(() => {
    setDecision(evaluateWebGlPolicy());

    if (typeof window === 'undefined' || !('matchMedia' in window)) {
      return;
    }

    const mediaQueryList = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = () => setDecision(evaluateWebGlPolicy());
    mediaQueryList.addEventListener('change', handleMotionChange);

    return () => {
      mediaQueryList.removeEventListener('change', handleMotionChange);
    };
  }, []);

  return decision;
}
