'use client';

import { useMediaQuery } from './use-media-query';

const PREFERS_REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Returns `true` when the user has asked for reduced motion at the OS level.
 *
 * Use this to skip non-essential animation (parallax, decorative tweens,
 * autoplaying scrubs). Don't use it to skip *functional* animation — for
 * example a stepper that derives its active step from scroll progress
 * should still update; only the easing transition should drop out.
 *
 * SSR: returns `false` on the server. The first client commit corrects
 * the value if the user opted in. This matches the default for visual
 * runtime decisions in `lib/visual-runtime/visual-runtime-policy.ts`.
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery(PREFERS_REDUCED_MOTION_QUERY);
}
