import { BREAKPOINT_PX, type Breakpoint } from './breakpoints';

// Mobile-first by API shape: base styles are mobile and the only media helper
// offered is min-width. A max-width helper deliberately does not exist.
export const mediaUp = (breakpoint: Breakpoint): string =>
  `@media (min-width: ${BREAKPOINT_PX[breakpoint]}px)`;
