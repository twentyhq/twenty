'use client';

import { useEffect, useState } from 'react';

import {
  evaluateWebGlPolicy,
  type WebGlPolicyDecision,
} from '../utils/visual-runtime-policy';

const PESSIMISTIC_INITIAL_DECISION: WebGlPolicyDecision = {
  allowed: false,
  reason: 'no-webgl-support',
  reducedMotion: false,
};

export function useWebGlPolicy(): WebGlPolicyDecision {
  const [decision, setDecision] = useState<WebGlPolicyDecision>(
    PESSIMISTIC_INITIAL_DECISION,
  );

  useEffect(() => {
    setDecision(evaluateWebGlPolicy());

    if (typeof window === 'undefined' || !('matchMedia' in window)) {
      return;
    }

    const mediaQueryList = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    );
    const handleMotionChange = () => setDecision(evaluateWebGlPolicy());

    if (typeof mediaQueryList.addEventListener === 'function') {
      mediaQueryList.addEventListener('change', handleMotionChange);

      return () => {
        mediaQueryList.removeEventListener('change', handleMotionChange);
      };
    }

    mediaQueryList.addListener(handleMotionChange);

    return () => {
      mediaQueryList.removeListener(handleMotionChange);
    };
  }, []);

  return decision;
}
