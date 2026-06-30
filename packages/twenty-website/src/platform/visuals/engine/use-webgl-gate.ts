'use client';

import { useSyncExternalStore } from 'react';

import { usePrefersReducedMotion } from '@/platform/motion';

import { isWebGlSupported } from './webgl-policy';

export type WebGlGate = {
  allowed: boolean;
  reducedMotion: boolean;
};

const subscribeNever = () => () => {};

// The probe result never changes within a session; reduced motion can.
export function useWebGlGate(): WebGlGate {
  const allowed = useSyncExternalStore(
    subscribeNever,
    isWebGlSupported,
    () => false,
  );
  const reducedMotion = usePrefersReducedMotion();

  return { allowed, reducedMotion };
}
