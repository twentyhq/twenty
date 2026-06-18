'use client';

import dynamic from 'next/dynamic';

// The ONLY import() of the studio: three + the WebGL canvas stay out of every
// initial chunk (check-visual-bundle), and the heavy tree is client-only
// (ssr:false) since it builds its scene in effects against the live DOM.
const HalftoneStudio = dynamic(
  () => import('./halftone-studio').then((module) => module.HalftoneStudio),
  { ssr: false },
);

export function HalftoneStudioMount() {
  return <HalftoneStudio />;
}
