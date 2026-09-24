import { MOBILE_VIEWPORT } from '@ui/theme-constants';
import { useMediaQuery } from '@ui/utilities/responsive/internal/useMediaQuery';

export const useIsMobile = () =>
  useMediaQuery(`(max-width: ${MOBILE_VIEWPORT}px)`);
