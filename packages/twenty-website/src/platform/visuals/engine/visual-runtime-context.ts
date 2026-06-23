'use client';

import { createContext } from 'react';

export type VisualRuntimeValue = {
  // True when the visitor prefers reduced motion AND the mount opted into a
  // designed reduced-motion state — the scene must render once and freeze.
  reducedMotion: boolean;
};

export const VisualRuntimeContext = createContext<VisualRuntimeValue>({
  reducedMotion: false,
});
