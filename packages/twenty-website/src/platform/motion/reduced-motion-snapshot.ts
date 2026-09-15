// Synchronous read for imperative layout code that runs outside React
// (hooks use usePrefersReducedMotion instead).
export function getReducedMotionSnapshot(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
