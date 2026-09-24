import { useMediaQuery } from '@ui/utilities/responsive/internal/useMediaQuery';

// Viewport width tells us how much room we have to lay things out, not how the
// user points at them: a narrow window on a desktop still hovers, a tablet in
// landscape never does. Interaction behaviour must branch on this, not on
// useIsMobile.
export const useIsTouchDevice = () =>
  useMediaQuery('(hover: none) and (pointer: coarse)');
