'use client';

import { theme } from '@/theme';
import { useSyncExternalStore } from 'react';

const MEDIA_QUERY = `(min-width: ${theme.breakpoints.md}px)`;

function subscribeToMdUp(callback: () => void) {
  const mediaQueryList = window.matchMedia(MEDIA_QUERY);
  mediaQueryList.addEventListener('change', callback);
  return () => {
    mediaQueryList.removeEventListener('change', callback);
  };
}

function getMdUpSnapshot() {
  return window.matchMedia(MEDIA_QUERY).matches;
}

function getMdUpServerSnapshot() {
  return false;
}

export function useStepperMdUp() {
  return useSyncExternalStore(
    subscribeToMdUp,
    getMdUpSnapshot,
    getMdUpServerSnapshot,
  );
}
