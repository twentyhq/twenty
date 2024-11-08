import { MOBILE_VIEWPORT } from '@ui/theme';
import { useMediaQuery } from 'react-responsive';

export const useIsMobile = () =>
  useMediaQuery({ query: `(max-width: ${MOBILE_VIEWPORT}px)` });
